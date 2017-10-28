const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const config = require('../config');

const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = config.get('port');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const METADATA = {
  host: HOST,
  port: PORT,
  ENV,
  HMR: false,
  AOT,
};

module.exports = () => webpackMerge(commonConfig({
  env: ENV,
}), {

  devtool: 'source-map',

  output: {
    path: helpers.root('dist'),

    filename: '[name].[chunkhash].bundle.js',

    sourceMapFilename: '[file].map',

    chunkFilename: '[name].[chunkhash].chunk.js',
  },

  module: {
    rules: [

    ],
  },

  plugins: [
    new ModuleConcatenationPlugin(),

    new OptimizeJsPlugin({
      sourceMap: false,
    }),

    new ExtractTextPlugin('[name].[contenthash].css'),

    new DefinePlugin({
      ENV: JSON.stringify(METADATA.ENV),
      HMR: METADATA.HMR,
      AOT: METADATA.AOT,
      'process.env.ENV': JSON.stringify(METADATA.ENV),
      'process.env.NODE_ENV': JSON.stringify(METADATA.ENV),
      'process.env.HMR': METADATA.HMR,
    }),

    new UglifyJsPlugin({
      parallel: true,
      uglifyOptions: {
        ie8: false,
        ecma: 6,
        warnings: true,
        mangle: true,
        output: {
          comments: false,
          beautify: false,
        },
      },
      warnings: true,
    }),

    new NormalModuleReplacementPlugin(
      /(angular2|@angularclass)((\\|\/)|-)hmr/,
      helpers.root('config/empty.js'),
    ),

    new NormalModuleReplacementPlugin(
      /zone\.js(\\|\/)dist(\\|\/)long-stack-trace-zone/,
      helpers.root('config/empty.js'),
    ),

    new HashedModuleIdsPlugin(),

    (AOT ? (
      new NormalModuleReplacementPlugin(
        /@angular(\\|\/)compiler/,
        helpers.root('config/empty.js'),
      )
    ) : (new LoaderOptionsPlugin({}))),

    new LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      options: {
        htmlLoader: {
          minimize: true,
          removeAttributeQuotes: false,
          caseSensitive: true,
          customAttrSurround: [
            [/#/, /(?:)/],
            [/\*/, /(?:)/],
            [/\[?\(?/, /(?:)/],
          ],
          customAttrAssign: [/\)?\]?=/],
        },
      },
    }),
  ],
  node: {
    global: true,
    crypto: 'empty',
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false,
  },
});
