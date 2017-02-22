/* eslint-disable import/no-extraneous-dependencies */

import os from 'os';
import path from 'path';
import webpack from 'webpack';

import config from './base.config.babel';

// Use webpack dev server
config.entry = [
  'webpack-dev-server/client?http://0.0.0.0:3000',
  'webpack/hot/only-dev-server',
  path.resolve(__dirname, '../app/scripts/main'),
];

// Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
config.output.publicPath = `//${os.hostname()}:3000/bundles/`;

config.plugins = config.plugins.concat([

  new webpack.HotModuleReplacementPlugin(),

  new webpack.NoErrorsPlugin(),

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development'),
      APP_ENV: JSON.stringify('browser'),
      RENDER_SERVER_PORT: 9009,
    },
  }),
]);

config.module.loaders.push(
  {
    test: /js\/.*\.(js|jsx)$/,
    loaders: ['babel'],
  },
  {
    test: /\.scss$/,
    loader: 'style-loader!css-loader?sourceMap!postcss-loader!sass-loader?sourceMap',
  },
);

export default config;
