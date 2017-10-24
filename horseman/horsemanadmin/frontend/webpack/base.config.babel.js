/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';

const context = path.resolve(__dirname, '../');

export const cssModulesGeneratedScopedName = '[local]__[hash:base64:5]';

export default {
  context,

  devtool: 'source-map',

  entry: {
    main: [
      'babel-polyfill',
      path.resolve(__dirname, '../js/main'),
    ],
  },

  output: {
    path: path.resolve(__dirname, '../bundles/'),
    filename: 'js/[name]-[hash].js',
  },

  module: {
    rules: [
      {
        test: /js\/.*\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            ['react-css-modules', {
              context,
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
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 10000, hash: 'sha512', digest: 'hex', name: 'images/[name]-[hash].[ext]' },
          },
          {
            loader: 'image-webpack-loader',
            query: {
              progressive: true,
              optimizationLevel: 7,
              interlaced: false,
              pngquant: { quality: '65-90', speed: 4 },
            },
          },
        ],
      },
      {
        test: /\.(woff2?|ttf|eot)$/,
        loader: 'url-loader',
        options: { limit: 10000, name: 'fonts/[name].[ext]' },
      },
    ],
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      context,
      options: {
        sassLoader: {
          sourceMaps: true,
          includePaths: [context],
        },
        context,
      },
    }),
    new webpack.NamedModulesPlugin(),
  ],

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'node_modules',
      path.resolve(__dirname, '../js'),
      path.resolve(__dirname, '../js/modules'),
    ],
    alias: {
      Components: path.resolve(__dirname, '../js/views/App/components'),
      Views: path.resolve(__dirname, '../js/views/App/views'),
      Styles: path.resolve(__dirname, '../scss'),
    },
  },
};
