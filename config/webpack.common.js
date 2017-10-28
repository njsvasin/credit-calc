const helpers = require('./helpers');

const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');

const HMR = helpers.hasProcessFlag('hot');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const METADATA = {
  title: 'Credit-calc',
  baseUrl: '/',
  isDevServer: helpers.isWebpackDevServer(),
  HMR,
  AOT,
};

module.exports = (options) => {
  const isProd = options.env === 'production';
  return {
    entry: {
      polyfills: './src/polyfills.browser.ts',
      main: AOT ? './src/main.browser.aot.ts' : './src/main.browser.ts',
    },

    resolve: {
      extensions: ['.ts', '.js', '.json'],

      modules: [helpers.root('src'), helpers.root('node_modules')],
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ng-router-loader',
              options: {
                loader: 'async-import',
                genDir: 'compiled',
                aot: AOT,
              },
            },
            {
              loader: 'awesome-typescript-loader',
              options: {
                configFileName: 'tsconfig.webpack.json',
                useCache: !isProd,
              },
            },
            {
              loader: 'ngc-webpack',
              options: {
                disable: !AOT,
              },
            },
            {
              loader: 'angular2-template-loader',
            },
          ],
          exclude: [/\.(spec|e2e)\.ts$/],
        },

        {
          test: /\.styl$/,
          use: ['to-string-loader', 'css-loader', 'stylus-loader'],
        },

        {
          test: /\.(pug)$/,
          use: ['raw-loader', 'pug-html-loader'],
        },
      ],

    },

    plugins: [
      new CheckerPlugin(),

      new CommonsChunkPlugin({
        name: 'polyfills',
        chunks: ['polyfills'],
      }),

      new ContextReplacementPlugin(
        /(.+)?angular(\\|\/)core(.+)?/,
        helpers.root('src'),
      ),

      new HtmlWebpackPlugin({
        template: 'src/index.html',
        title: METADATA.title,
        chunksSortMode: (a, b) => {
          const entryPoints = ['inline', 'polyfills', 'sw-register', 'styles', 'vendor', 'main'];
          return entryPoints.indexOf(a.names[0]) - entryPoints.indexOf(b.names[0]);
        },
        metadata: METADATA,
        inject: 'body',
      }),

      new ScriptExtHtmlWebpackPlugin({
        sync: /polyfills|vendor/,
        defaultAttribute: 'async',
        preload: [/polyfills|vendor|main/],
        prefetch: [/chunk/],
      }),

      new HtmlElementsPlugin({
        headTags: require('./head-config.common'),
      }),

      new LoaderOptionsPlugin({}),

      new ngcWebpack.NgcWebpackPlugin({
        disabled: !AOT,
        tsConfig: helpers.root('tsconfig.webpack.json'),
      }),

      new InlineManifestWebpackPlugin(),
    ],

    node: {
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false,
    },
  };
};
