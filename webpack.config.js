const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const stripJsonComments = require('strip-json-comments');
const package = require('./package.json');
const SVGO = require('svgo');

const CopyPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const InertEntryPlugin = require('inert-entry-webpack-plugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const WebextensionManifestPlugin = require('./utils/webextension-manifest-webpack-plugin/plugin');

const { deepIteratePlainObjects, objectMapFilter } = require('./utils.js');

const svgo = new SVGO({
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
});
const BROWSER_POLYFILL_PATH = path.resolve(
  __dirname,
  './node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
);
const VENDORS = ['firefox', 'chrome'];
const TARGET_VENDOR = process.env.TARGET_VENDOR;

const base = {
  context: path.resolve(__dirname, './src'),
  entry: {
    manifest: './manifest.json',
    //options_ui: './options_ui/index.ts',
    //content_script: './content_script/index.ts',
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './build', TARGET_VENDOR),
    filename: '[name]/index.js',
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
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
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
      {
        test: /\.css$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
          'extract-loader',
          //'vue-style-loader',
          'css-loader',
        ],
      },
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
                indentedSyntax: true, // optional
              },
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        oneOf: [
          {
            exclude: /\.vue/,
            use: ['pug-loader'],
          },
          {
            use: ['pug-plain-loader'],
          },
        ],
      },

      {
        type: 'javascript/auto', // prevent json-loader
        test: /manifest\.json$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
          'extract-loader',
          {
            loader: require.resolve(
              './utils/webextension-manifest-webpack-plugin/loader'
            ),
            options: {
              targetVendor: TARGET_VENDOR,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
          {
            loader: 'img-loader',
            options: {
              plugins: [
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
    new WebextensionManifestPlugin({
      manifest: './manifest.json',
      targetVendor: TARGET_VENDOR,
    }),
    // new SingleEntryPlugin(
    //   path.resolve(__dirname, './src'),
    //   './content_script/index.ts',
    //   'content_script'
    // ),
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       from: './manifest.json',
    //       to: './',
    //       transform(content) {
    //         const manifest = JSON.parse(stripJsonComments(content.toString()));

    //         for (const obj of deepIteratePlainObjects(manifest)) {
    //           const newObj = objectMapFilter(obj, (key, val) => {
    //             const pattern = new RegExp(
    //               `^__(?:\\+?(${VENDORS.join('|')}))*_(.*)__$`
    //             );
    //             const found = key.match(pattern);
    //             if (found) {
    //               const keyVendors = found[1];
    //               if (!keyVendors.includes(VENDOR)) return null;
    //               key = found[2];
    //             }
    //             if (val === '__VERSION__') val = package.version;
    //             return [key, val];
    //           });
    //           for (const key of Object.keys(obj)) delete obj[key];
    //           Object.assign(obj, newObj);
    //         }
    //         return JSON.stringify(manifest, null, 2);
    //       },
    //     },
    //     { from: './content_script/style.css', to: './content_script/' },
    //     { from: './options_ui/background.svg', to: './options_ui/' },
    //     { from: './options_ui/style.css', to: './options_ui/' },
    //     {
    //       from: './icon.svg',
    //       to: './',
    //       async transform(content) {
    //         const result = await svgo.optimize(content.toString());
    //         return result.data;
    //       },
    //     },
    //     ...(VENDOR !== 'firefox'
    //       ? [BROWSER_POLYFILL_PATH, './icon-48.png', './icon-96.png']
    //       : []),
    //   ],
    // }),
    // new HtmlWebpackPlugin({
    //   filename: './options_ui/index.html',
    //   chunks: ['options_ui'],
    //   title: 'AO3 Enhancements',
    // }),
    // new AddAssetHtmlPlugin({
    //   filepath: './options_ui/style.css',
    //   typeOfAsset: 'css',
    //   files: './options_ui/index.html',
    //   outputPath: './options_ui',
    //   publicPath: '/options_ui/',
    // }),
    // ...(TARGET_VENDOR !== 'firefox'
    //   ? [
    //       new AddAssetHtmlPlugin({
    //         filepath: BROWSER_POLYFILL_PATH,
    //         files: './options_ui/index.html',
    //         outputPath: './',
    //         publicPath: '/',
    //       }),
    //     ]
    //   : []),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    // new VueLoaderPlugin(),
    // new VuetifyLoaderPlugin(),
    new webpack.ProgressPlugin({ profile: false }),
    // new InertEntryPlugin(),
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
