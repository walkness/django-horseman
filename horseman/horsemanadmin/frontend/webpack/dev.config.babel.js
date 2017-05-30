/* eslint-disable import/no-extraneous-dependencies */

import os from 'os';
import path from 'path';
import webpack from 'webpack';
import BundleTracker from 'webpack-bundle-tracker';

import config, { cssModulesGeneratedScopedName } from './base.config.babel';

// Use webpack dev server
config.entry.main = [
  'babel-polyfill',
  'react-hot-loader/patch',
  'webpack-dev-server/client?http://0.0.0.0:3010',
  'webpack/hot/only-dev-server',
  path.resolve(__dirname, '../js/main'),
];

// Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
config.output.publicPath = `//${os.hostname()}:3010/bundles/`;

config.plugins = config.plugins.concat([

  new webpack.HotModuleReplacementPlugin(),

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development'),
      APP_ENV: JSON.stringify('browser'),
      RENDER_SERVER_PORT: 9009,
    },
  }),

  new BundleTracker({ filename: './webpack-stats.json' }),
]);

config.module.rules.push(
  {
    test: /\.scss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 2,
          modules: true,
          localIdentName: cssModulesGeneratedScopedName,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
  {
    test: /\.css$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 1,
          modules: true,
          localIdentName: cssModulesGeneratedScopedName,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
  {
    test: /\.css$/,
    include: /node_modules/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
);

config.devtool = 'inline-source-map';

config.devServer = {
  host: '0.0.0.0',
  port: 3010,

  publicPath: config.output.publicPath,

  historyApiFallback: true,

  hot: true,

  stats: {
    colors: true,
  },

  disableHostCheck: true,

  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  },
};

export default config;
