const path = require('path');
const webpack = require('webpack');

const CopyPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    options_ui: './options_ui/index.ts',
    content_script: './content_script/index.ts',
    background: './background/index.ts',
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './build'),
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
        use: ['vue-style-loader', 'css-loader'],
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
        use: ['pug-plain-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        './manifest.json',
        { from: './content_script/style.css', to: './content_script/' },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: './options_ui/index.html',
      chunks: ['options_ui'],
      title: 'AO3 Enhancements',
    }),
    new AddAssetHtmlPlugin({
      filepath: './options_ui/style.css',
      typeOfAsset: 'css',
      files: './options_ui/index.html',
      outputPath: './options_ui',
      publicPath: '/options_ui/',
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin(),
  ],
};
