/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BundleTracker from 'webpack-bundle-tracker';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

import config, { cssModulesGeneratedScopedName } from './base.config.babel';

config.output.path = path.resolve(__dirname, '../dist/');
config.output.publicPath = '/static/horsemanadmin/';
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

  new ExtractTextPlugin({
    filename: 'styles/[name]-[md5:contenthash:hex:20].css',
    allChunks: true,
  }),

  new BundleTracker({
    path: path.resolve(__dirname, '../dist/'),
    filename: 'webpack-stats.json',
  }),
]);

config.optimization = {
  minimizer: [
    new UglifyJSPlugin({
      sourceMap: true,
    }),
  ],
};

const cssNano = {
  autoprefixer: false,
  discardComments: { removeAll: true },
};

config.module.rules.push(
  {
    test: /node_modules\/.*\.css$/,
    exclude: /node_modules\/react-rte\/src/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            minimize: cssNano,
            sourceMap: true,
            importLoaders: 0,
          },
        },
      ],
    }),
  },
  {
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            minimize: cssNano,
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
    }),
  },
  {
    test: /\.css$/,
    exclude: /node_modules(?!\/react-rte\/src)/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            minimize: cssNano,
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
    }),
  },
);

config.mode = 'production';

export default config;
