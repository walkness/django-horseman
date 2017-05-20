/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BundleTracker from 'webpack-bundle-tracker';
import CleanWebpackPlugin from 'clean-webpack-plugin';

import config, { cssModulesGeneratedScopedName } from './base.config.babel';

config.output.path = path.resolve(__dirname, '../dist/');
config.output.publicPath = '//static.walkandalie.com/';
config.output.libraryTarget = 'umd';

// Add HotModuleReplacementPlugin and BundleTracker plugins
config.plugins = config.plugins.concat([
  new CleanWebpackPlugin(path.resolve(__dirname, '../dist/'), { root: config.context }),

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

  new BundleTracker({
    path: path.resolve(__dirname, '../dist/'),
    filename: 'webpack-stats.json',
  }),
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
        ['react-css-modules', {
          context: config.context,
          generateScopedName: cssModulesGeneratedScopedName,
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
    use: ExtractTextPlugin.extract({
      use: [
        `css-loader?${JSON.stringify(cssNano)}&modules&importLoaders=2&localIdentName=${cssModulesGeneratedScopedName}`,
        'postcss-loader',
        'sass-loader',
      ],
      fallback: 'style-loader',
    }),
  },
  {
    test: /\.css$/,
    exclude: /node_modules/,
    use: ExtractTextPlugin.extract({
      use: [
        `css-loader?${JSON.stringify(cssNano)}&modules&importLoaders=2&localIdentName=${cssModulesGeneratedScopedName}`,
        'postcss-loader',
      ],
      fallback: 'style-loader',
    }),
  },
  {
    test: /\.css$/,
    include: /node_modules/,
    use: ExtractTextPlugin.extract({
      use: [
        'css-loader?sourceMap&importLoaders=1',
        'postcss-loader',
      ],
      fallback: 'style-loader',
    }),
  },
);

export default config;
