import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import imageminSVGO from 'imagemin-svgo';
import sass from 'sass';
import fibers from 'fibers';

import VueLoaderPlugin from 'vue-loader/lib/plugin';
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
import InertEntryPlugin from 'inert-entry-webpack-plugin';

import packageJson from './package.json';

const TARGET_VENDOR = process.env.TARGET_VENDOR as 'firefox' | 'chrome';

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
    extensions: ['.ts', '.js'],
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
            loader: require.resolve('./utils/webextension-manifest-loader'),
            options: {
              targetVendor: TARGET_VENDOR,
              merge: {
                version: packageJson.version,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      // Load vue SFC properly (see also the VueLoaderPlugin)
      {
        test: /\.vue$/,
        loader: 'vue-loader',
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
          // If it's a template return a template function
          {
            test: /\.template.pug$/,
            loader: 'pug-loader',
          },
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
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/.vue$/],
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
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
              sassOptions: {
                fiber: fibers,
                indentedSyntax: true,
              },
            },
          },
        ],
      },
      // Load .png and .svg files,
      {
        test: /\.(svg|png)$/i,
        use: [
          'file-loader?name=[path][name].[ext]',
          {
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
                        preserve: ['main'],
                      },
                    },
                  ],
                }),
              ],
            },
          },
        ],
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

    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.ProgressPlugin({ profile: false }),
  ],
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
  });
}

export default config;
