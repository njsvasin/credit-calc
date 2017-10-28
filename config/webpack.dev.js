const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const config = require('../config');

const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = config.get('devport');
const PUBLIC = process.env.PUBLIC_DEV || `${HOST}:${PORT}`;
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const HMR = helpers.hasProcessFlag('hot');
const METADATA = {
  host: HOST,
  port: PORT,
  public: PUBLIC,
  ENV,
  HMR,
  AOT,
};

module.exports = () => webpackMerge(commonConfig({ env: ENV }), {
  devtool: 'cheap-module-source-map',

  output: {

    path: helpers.root('dist'),

    filename: '[name].bundle.js',

    sourceMapFilename: '[file].map',

    chunkFilename: '[id].chunk.js',

    library: 'ac_[name]',
    libraryTarget: 'var',
  },

  module: {
    rules: [

    ],
  },

  plugins: [
    new DefinePlugin({
      ENV: JSON.stringify(METADATA.ENV),
      HMR: METADATA.HMR,
      'process.env.ENV': JSON.stringify(METADATA.ENV),
      'process.env.NODE_ENV': JSON.stringify(METADATA.ENV),
      'process.env.HMR': METADATA.HMR,
    }),

    new LoaderOptionsPlugin({
      debug: true,
      options: {},
    }),

    new HotModuleReplacementPlugin(),

  ],

  devServer: {
    port: METADATA.port,
    host: METADATA.host,
    hot: METADATA.HMR,
    public: METADATA.public,
    historyApiFallback: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  },

  node: {
    global: true,
    crypto: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false,
  },
});
