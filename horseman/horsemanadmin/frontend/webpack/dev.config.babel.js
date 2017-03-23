/* eslint-disable import/no-extraneous-dependencies */

import os from 'os';
import path from 'path';
import webpack from 'webpack';
import BundleTracker from 'webpack-bundle-tracker';

import config from './base.config.babel';

// Use webpack dev server
config.entry = [
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
    test: /js\/.*\.(js|jsx)$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    query: {
      plugins: [
        ['babel-plugin-react-css-modules', {
          context: config.context,
          filetypes: {
            '.scss': 'postcss-scss',
          },
          webpackHotModuleReloading: true,
        }],
      ],
    },
  },
  {
    test: /\.scss$/,
    include: path.resolve(config.context, './js/'),
    use: [
      'style-loader',
      'css-loader?sourceMap&modules&importLoaders=2&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
      'postcss-loader',
      'sass-loader',
    ],
  },
  {
    test: /\.scss$/,
    exclude: path.resolve(config.context, './js/'),
    use: [
      'style-loader',
      'css-loader?importLoaders=2',
      'postcss-loader',
      'sass-loader',
    ],
  },
  {
    test: /\.css$/,
    include: path.resolve(config.context, './js/'),
    use: [
      'style-loader',
      'css-loader?sourceMap&modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
      'postcss-loader',
    ],
  },
  {
    test: /\.css$/,
    exclude: path.resolve(config.context, './js/'),
    use: [
      'style-loader',
      'css-loader?importLoaders=1',
      'postcss-loader',
    ],
  },
);

export default config;
