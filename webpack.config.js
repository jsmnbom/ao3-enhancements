const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const package = require('./package.json');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
const InertEntryPlugin = require('inert-entry-webpack-plugin');

const TARGET_VENDOR = process.env.TARGET_VENDOR;

const base = {
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
                version: package.version,
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
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
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
                require('imagemin-svgo')({
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
  module.exports = merge(base, {
    mode: 'development',
    devtool: 'inline-source-map',
    performance: {
      hints: false,
    },
  });
} else {
  module.exports = merge(base, {
    mode: 'production',
    performance: {
      // 1MB
      maxEntrypointSize: Math.pow(2, 20),
      maxAssetSize: Math.pow(2, 20),
    },
  });
}
