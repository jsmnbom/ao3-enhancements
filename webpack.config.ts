import path from 'path';

import webpack, { Compilation, Compiler } from 'webpack';
import { merge as webpackMerge } from 'webpack-merge';
import imageminSVGO from 'imagemin-svgo';
import { extendDefaultPlugins } from 'svgo';
import sass from 'sass';
import VueLoaderPlugin from 'vue-loader/lib/plugin';
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
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
        /* eslint-disable */
        // @ts-ignore
        plugins: extendDefaultPlugins([
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'cleanupIDs',
            params: {
              preserve: ['ao3e-logo-main'],
            },
          },
        ]),
        /* eslint-enable */
      }),
    ],
  },
};

const fileLoader = {
  loader: 'file-loader',
  options: {
    name: '[path][name].[ext]',
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
    filename: '[name].js',
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js',
      '@': path.resolve(__dirname, './src/'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      // Load manifest.json file
      {
        type: 'asset/resource',
        test: /manifest\.json$/,
        generator: {
          filename: '[name][ext]',
        },
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
        loader: 'entry-loader',
        options: {
          name: '[path][name].js',
        },
      },
      // Load pug files
      {
        test: /\.pug$/,
        oneOf: [
          // If it's an entry file, use html-loader to resolve and output file
          {
            resourceQuery: /entry/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[path][name].html',
                },
              },

              'extract-loader',
              {
                loader: 'html-loader',
                options: {
                  minimize: {
                    removeComments: true,
                    collapseWhitespace: true,
                  },
                  esModule: false,
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
            use: [fileLoader, 'extract-loader', 'css-loader'],
          },
          // But load styles inside vue SFC using vue-style-loader
          {
            use: ['style-loader', 'css-loader'],
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
              'style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: {
                  implementation: sass,
                  sourceMap: false,
                  sassOptions: {
                    indentedSyntax: false,
                  },
                },
              },
            ],
          },
          {
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: {
                  implementation: sass,
                  sourceMap: false,
                  sassOptions: {
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
            use: [fileLoader, imgLoader],
          },
        ],
      },
      // Load .ico files
      {
        test: /\.ico$/,
        use: [fileLoader],
      },
    ],
  },
  plugins: [
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

    // We remove node.global below since it has eval
    // Include our own version here
    new webpack.ProvidePlugin({
      global: require.resolve('./src/global.js'),
    }),
    {
      apply: (compiler: Compiler): void => {
        compiler.hooks.compilation.tap(
          'DeleteAssetPlugin',
          (compilation: Compilation) => {
            compilation.hooks.processAssets.tap('DeleteAssetPlugin', () => {
              // Remove all chunk assets
              compilation.chunks.forEach((chunk) => {
                if (chunk.name == 'manifest') {
                  chunk.files.forEach((file) => {
                    compilation.deleteAsset(file);
                  });
                }
              });
            });
          }
        );
      },
    },
  ],
  node: {
    global: false,
  },
  stats: {
    modules: false,
    entrypoints: false,
    builtAt: true,
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
