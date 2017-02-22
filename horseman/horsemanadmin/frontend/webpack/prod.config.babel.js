/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import config from './webpack.base.config.babel';

config.output.path = path.resolve(__dirname, '../dist/client/');
config.output.publicPath = '/static/';
config.output.libraryTarget = 'umd';

// Add HotModuleReplacementPlugin and BundleTracker plugins
config.plugins = config.plugins.concat([

  // removes a lot of debugging code in React
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
      APP_ENV: JSON.stringify('browser'),
      RENDER_SERVER_PORT: 9009,
    },
  }),

  // keeps hashes consistent between compilations
  new webpack.optimize.OccurenceOrderPlugin(),

  // minifies code
  new webpack.optimize.UglifyJsPlugin({
    output: {
      comments: false,
    },
    compressor: {
      warnings: false,
    },
  }),

  new ExtractTextPlugin('styles/[name]-[hash].css'),
]);

const cssNano = {
  discardComments: { removeAll: true },
};

config.module.loaders.push(
  {
    test: /js\/.*\.(js|jsx)$/,
    exclude: /node_modules|\.tmp|vendor/,
    loaders: ['babel'],
  },
  {
    test: /\.scss$/,
    exclude: /node_modules|\.tmp|vendor/,
    loader: ExtractTextPlugin.extract('style-loader', `css-loader?${JSON.stringify(cssNano)}!postcss-loader!sass-loader`), // eslint-disable-line max-len
  }
);

export default config;
