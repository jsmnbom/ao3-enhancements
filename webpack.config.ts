import path from 'path';

import webpack, { Chunk, Compilation, Compiler } from 'webpack';
import { merge as webpackMerge } from 'webpack-merge';
import imageminSVGO from 'imagemin-svgo';
import sass from 'sass';
import VueLoaderPlugin from 'vue-loader/lib/plugin';
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import JsonpTemplatePlugin from 'webpack/lib/web/JsonpTemplatePlugin';
import semver from 'semver';

import packageJson from './package.json';
import IconsLoaderPlugin from './loaders/icons/plugin';

const TARGET_VENDOR = process.env.TARGET_VENDOR as 'firefox' | 'chrome';

const LOCAL_SITE = process.env.LOCAL_SITE as undefined | 'yes' | 'no';

let version = packageJson.version;
const versionName = version;
const MAX = 65535;
const parsed = semver.parse(version);
if (parsed.prerelease) {
  if (TARGET_VENDOR === 'chrome') {
    if (parsed.major > 0) {
      parsed.major--;
      parsed.minor = MAX;
      parsed.patch = MAX;
    } else {
      parsed.minor--;
      parsed.patch = MAX;
    }
    let forth = 0;
    if (parsed.prerelease[0] == 'alpha') {
      forth = 1000 + +parsed.prerelease[1];
    }
    if (parsed.prerelease[0] == 'beta') {
      forth = 2000 + +parsed.prerelease[1];
    }
    if (parsed.prerelease[0] == 'rc') {
      forth = 3000 + +parsed.prerelease[1];
    }
    parsed.prerelease = [];
    version = `${parsed.format()}.${forth}`;
  } else if (TARGET_VENDOR === 'firefox') {
    const x = parsed.prerelease.join('');
    parsed.prerelease = [];
    version = `${parsed.format()}${x}`;
  }
}

// We need this in multiple rules
const imgLoader = {
  loader: 'img-loader',
  options: {
    plugins: [
      // Optimize svg but make sure to preverse #main and the viewbox
      imageminSVGO({
        plugins: [
          {
            /* eslint-disable */
            // @ts-ignore
            name: 'preset-default',
            params: {
              overrides: {
                cleanupIDs: {
                  preserve: ['ao3e-logo-main'],
                },
                removeViewBox: false,
              },
            },
            /* eslint-enable */
          },
        ],
      }),
    ],
  },
};

const fileLoader = {
  loader: 'file-loader',
  options: {
    name: (file: string): string => {
      if (file.endsWith('.scss')) {
        return '[path][name].css';
      }
      return '[path][name].[ext]';
    },
  },
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    implementation: sass,
    sourceMap: false,
  },
};

const styleOrExtractLoader =
  process.env.NODE_ENV !== 'production'
    ? 'style-loader'
    : MiniCssExtractPlugin.loader;

let config: webpack.Configuration = {
  target: 'web',
  context: path.resolve(__dirname, './src'),
  entry: {
    manifest: './manifest.json',
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, './build', TARGET_VENDOR),
    filename: '[name].js',
    chunkFilename: (pathData) => {
      return `${(pathData.chunk! as Chunk)
        .runtime!}/${(pathData.chunk as Chunk)!
        .id!.toString()
        .replace(`^${pathData.runtime}`, '')}.js`;
    },
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
                version,
                ...(TARGET_VENDOR === 'chrome'
                  ? { version_name: versionName }
                  : {}),
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
                  name: '[name].html',
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
                    prod: process.env.NODE_ENV === 'production',
                  },
                },
              },
            ],
          },
          {
            loader: 'entry-loader',
            options: {
              name: '[path][name].js',
              plugins: [
                new JsonpTemplatePlugin(),
                new MiniCssExtractPlugin({
                  filename: ({ chunk }) => {
                    return `${(chunk as Chunk).runtime!}/${
                      (chunk as Chunk).name
                    }.css`;
                  },
                  chunkFilename: ({ chunk }) => {
                    return `${(chunk as Chunk).runtime!}/${
                      (chunk as Chunk).id
                    }.css`;
                  },
                }),
              ],
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
            use: [styleOrExtractLoader, 'css-loader'],
          },
          // SASS
          {
            test: /\.s(c|a)ss$/,
            use: [styleOrExtractLoader, 'css-loader', sassLoader],
          },
        ],
      },

      // Images within content scripts
      {
        issuer: /content_script/,
        test: /\.(svg|png)$/,
        use: ['raw-loader', imgLoader],
      },
      // SCSS for content_script (from manifest.json)
      {
        test: /\.scss$/,
        issuer: /manifest\.json/,
        use: [fileLoader, 'extract-loader', 'css-loader', sassLoader],
      },
      // SASS from node_modules (for vuetify etc.)
      {
        include: /node_modules/,
        test: /\.s(c|a)ss$/,
        use: [styleOrExtractLoader, 'css-loader', sassLoader],
      },
      // Images (as file)
      {
        issuer: { not: /content_script/ },
        test: /\.(svg|png)$/,
        use: [fileLoader],
      },
      // .ico
      {
        test: /\.ico$/,
        use: [fileLoader],
      },
      // Fix eval usage in node_modules
      // Could probably be done better, but this works too
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'node_modules'),
        loader: 'string-replace-loader',
        options: {
          search: /Function\(["']return this;?["']\)\(\)/g,
          replace: 'this',
        },
      },
      // Allow using local version of archive
      ...(LOCAL_SITE === 'yes'
        ? [
            {
              exclude: path.resolve(__dirname, 'node_modules'),
              test: /\.(jsx?|tsx?|json)$/,
              loader: 'string-replace-loader',
              options: {
                multiple: [
                  {
                    search: /\*:\/\/\*\.archiveofourown.org/g,
                    replace: 'http://localhost',
                  },
                  {
                    search: /https:\/\/archiveofourown.org/g,
                    replace: 'http://localhost:3000',
                  },
                ],
              },
            },
          ]
        : []),
      // Mark chart lib as side effect free to improve treeshaking
      {
        include: {
          or: [
            path.resolve(__dirname, 'node_modules/@carbon/charts'),
            path.resolve(__dirname, 'node_modules/@carbon/charts-vue'),
          ],
        },
        sideEffects: false,
      },
    ],
  },
  plugins: [
    // Support vue SFC
    new VueLoaderPlugin(),
    // Tree shaking for vuetify
    new VuetifyLoaderPlugin(),
    // MDI Icons auto import in vue
    new IconsLoaderPlugin(),
    // CSS extraction in production
    new MiniCssExtractPlugin(),
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
          },
        }),
      ],
    },
  });
}

export default config;
