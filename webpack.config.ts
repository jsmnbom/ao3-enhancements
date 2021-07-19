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

const sassLoader = {
  loader: 'sass-loader',
  options: {
    implementation: sass,
    sourceMap: false,
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

      // Entry points
      {
        resourceQuery: /entry/,
        oneOf: [
          // Pug entry files (options_ui, popups, etc.)
          {
            test: /\.pug$/,
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
          {
            loader: 'entry-loader',
            options: {
              name: '[path][name].js',
            },
          },
        ],
      },
      // Typescript (needed for all)
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
      },
      // Load vue SFC (see also the VueLoaderPlugin)
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            prettier: false,
          },
        },
      },
      // Within vue SFC files
      {
        issuer: /\.vue/,
        oneOf: [
          // Pug templates
          {
            test: /\.pug$/,
            loader: 'pug-plain-loader',
          },
          // CSS
          {
            test: /\.css/,
            use: ['style-loader', 'css-loader'],
          },
          // SASS
          {
            test: /\.s(c|a)ss$/,
            use: ['style-loader', 'css-loader', sassLoader],
          },
        ],
      },

      // Within content scripts
      {
        issuer: /content_script/,
        rules: [
          // CSS
          {
            test: /\.css$/,
            loader: 'css-loader',
          },
          // SASS
          {
            test: /\.s(c|a)ss$/,
            use: ['css-loader', sassLoader],
          },
          // Images
          {
            test: /\.(svg|png)$/,
            use: ['raw-loader', imgLoader],
          },
        ],
      },
      // CSS for content_script (from manifest.json)
      {
        test: /\.css$/,
        issuer: /manifest\.json/,
        use: [fileLoader, 'extract-loader', 'css-loader'],
      },
      // SASS from node_modules (for vuetify etc.)
      {
        include: /node_modules/,
        test: /\.s(c|a)ss$/,
        use: ['style-loader', 'css-loader', sassLoader],
      },
      // Images (as file)
      {
        issuer: { not: /content_script/ },
        test: /\.(svg|png)$/,
        use: [fileLoader, imgLoader],
      },
      // .ico
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
    children: true,
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
