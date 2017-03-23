/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BundleTracker from 'webpack-bundle-tracker';

import config from './base.config.babel';

config.output.path = path.resolve(__dirname, '../dist/');
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

  // minifies code
  new webpack.optimize.UglifyJsPlugin({
    output: {
      comments: false,
    },
    compressor: {
      warnings: false,
    },
  }),

  new ExtractTextPlugin({
    filename: 'styles/[name]-[hash].css',
    allChunks: true,
  }),

  new BundleTracker({ filename: './webpack-stats.prod.json' }),
]);

const cssNano = {
  discardComments: { removeAll: true },
};

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
    use: ExtractTextPlugin.extract({
      use: [
        `css-loader?${JSON.stringify(cssNano)}&modules&importLoaders=2&localIdentName=[path]___[name]__[local]___[hash:base64:5]`,
        'postcss-loader',
        'sass-loader',
      ],
      fallback: 'style-loader',
    }),
  },
  {
    test: /\.scss$/,
    exclude: path.resolve(config.context, './js/'),
    use: ExtractTextPlugin.extract({
      use: [
        `css-loader?${JSON.stringify(cssNano)}&importLoaders=2`,
        'postcss-loader',
        'sass-loader',
      ],
      fallback: 'style-loader',
    }),
  },
  {
    test: /\.css$/,
    include: path.resolve(config.context, './js/'),
    use: ExtractTextPlugin.extract({
      use: [
        `css-loader?${JSON.stringify(cssNano)}&modules&importLoaders=2&localIdentName=[path]___[name]__[local]___[hash:base64:5]`,
        'postcss-loader',
      ],
      fallback: 'style-loader',
    }),
  },
  {
    test: /\.css$/,
    exclude: path.resolve(config.context, './js/'),
    use: ExtractTextPlugin.extract({
      use: [
        `css-loader?${JSON.stringify(cssNano)}&importLoaders=2`,
        'postcss-loader',
      ],
      fallback: 'style-loader',
    }),
  },
);

export default config;
