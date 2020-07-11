import path from 'path';

import webpack from 'webpack';
import { merge as webpackMerge } from 'webpack-merge';
import imageminSVGO from 'imagemin-svgo';
import sass from 'sass';
import fibers from 'fibers';
import VueLoaderPlugin from 'vue-loader/lib/plugin';
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
import InertEntryPlugin from 'inert-entry-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

import packageJson from './package.json';

const TARGET_VENDOR = process.env.TARGET_VENDOR as 'firefox' | 'chrome';

// We need this in multiple rules
const imgLoader = {
  loader: 'img-loader',
  options: {
    plugins: [
      // Optimize svg but make sure to preverse #main and the viewbox
      imageminSVGO({
        plugins: [
          {
            removeViewBox: false,
          },
          {
            cleanupIDs: {
              preserve: ['ao3e-logo-main'],
            },
          },
        ],
      }),
    ],
  },
};

let config: webpack.Configuration = {
  context: path.resolve(__dirname, './src'),
  entry: {
    manifest: './manifest.json',
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './build', TARGET_VENDOR),
    filename: 'manifest.json',
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js',
      '@': path.resolve(__dirname, './src/'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // Load manifest.json file
      {
        type: 'javascript/auto', // prevent json-loader
        test: /manifest\.json$/,
        use: [
          'extract-loader',
          {
            loader: 'webextension-manifest-loader',
            options: {
              targetVendor: TARGET_VENDOR,
              merge: {
                version: packageJson.version,
              },
            },
          },
        ],
      },
      // Load vue SFC properly (see also the VueLoaderPlugin)
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            prettier: false,
          },
        },
      },
      // Load entry files (only script ones - pug ones are below)
      {
        resourceQuery: /entry/,
        exclude: /\.pug/,
        loader: 'spawn-loader?name=[path][name].js',
      },
      // Load pug files
      {
        test: /\.pug$/,
        oneOf: [
          // If it's an entry file, use html-loader to resolve and output file
          {
            resourceQuery: /entry/,
            use: [
              'file-loader?name=[path][name].html',
              'extract-loader',
              {
                loader: 'html-loader',
                options: {
                  minimize: {
                    removeComments: true,
                    collapseWhitespace: true,
                  },
                  attributes: {
                    list: [
                      // By default only stylesheets
                      // also import favicons etc.
                      {
                        tag: 'link',
                        attribute: 'href',
                        type: 'src',
                      },
                      {
                        tag: 'script',
                        attribute: 'src',
                        type: 'src',
                      },
                    ],
                  },
                },
              },
              {
                loader: 'pug-plain-loader',
                options: {
                  data: {
                    polyfill: TARGET_VENDOR !== 'firefox',
                  },
                },
              },
            ],
          },
          // Otherwise it's part of a vue file so load it plainly
          {
            use: ['pug-plain-loader'],
          },
        ],
      },
      // Load typescript files and make sure to support vue SFC
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/.vue$/],
              transpileOnly: true,
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              experimentalWatchApi: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      // Load css
      {
        test: /\.css$/,
        oneOf: [
          // Load our raw css directly
          {
            exclude: /\.vue/,
            use: [
              'file-loader?name=[path][name].[ext]',
              'extract-loader',
              'css-loader',
            ],
          },
          // But load styles inside vue SFC using vue-style-loader
          {
            use: ['vue-style-loader', 'css-loader'],
          },
        ],
      },
      // Vuetify needs a sass loader

      {
        test: /\.s(c|a)ss$/,
        oneOf: [
          {
            exclude: /node_modules/,
            use: [
              'vue-style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: {
                  implementation: sass,
                  sourceMap: false,
                  sassOptions: {
                    fiber: fibers,
                    indentedSyntax: false,
                  },
                },
              },
            ],
          },
          {
            use: [
              'vue-style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: {
                  implementation: sass,
                  sourceMap: false,
                  sassOptions: {
                    fiber: fibers,
                    indentedSyntax: true,
                  },
                },
              },
            ],
          },
        ],
      },
      // Load .png and .svg files
      {
        test: /\.(svg|png)$/,
        oneOf: [
          // In content_scripts (as raw js)
          {
            issuer: /content_script/,
            use: ['raw-loader', imgLoader],
          },
          // Otherwise with file-loader e.g. from manifest.json
          {
            use: ['file-loader?name=[path][name].[ext]', imgLoader],
          },
        ],
      },
      // Load .ico files
      {
        test: /\.ico$/,
        loader: 'file-loader?name=[path][name].[ext]',
      },
    ],
  },
  plugins: [
    // Make sure the manifest.json entry doesn't output a .js file too
    new InertEntryPlugin(),
    // Support vue SFC
    new VueLoaderPlugin(),
    // Tree shaking for vuetify
    new VuetifyLoaderPlugin(),
    // TS type checking
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        extensions: {
          vue: true,
        },
        configFile: path.resolve(__dirname, 'tsconfig.json'),
      },
    }),
    // Define NODE_ENV
    new webpack.EnvironmentPlugin(['NODE_ENV']),

    // Doesn't work properly with webextension-manifest-loader
    //new webpack.ProgressPlugin({ profile: false }),
  ],
  node: {
    setImmediate: false,
  },
  stats: {
    modules: false,
  },
};

if (process.env.NODE_ENV === 'development') {
  config = webpackMerge(config, {
    mode: 'development',
    devtool: 'inline-source-map',
    performance: {
      hints: false,
    },
  });
} else {
  config = webpackMerge(config, {
    mode: 'production',
    performance: {
      // 1MB
      maxEntrypointSize: Math.pow(2, 20),
      maxAssetSize: Math.pow(2, 20),
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
          terserOptions: {
            keep_classnames: true,
            keep_fnames: true,
          },
        }),
      ],
    },
  });
}

export default config;
