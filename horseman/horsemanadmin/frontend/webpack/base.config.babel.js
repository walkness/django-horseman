/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';

const context = path.resolve(__dirname, '../');

export const cssModulesGeneratedScopedName = '[local]__[hash:base64:5]';

export default {
  context,

  entry: {
    main: path.resolve(__dirname, '../js/main.jsx'),
  },

  output: {
    path: path.resolve(__dirname, '../bundles/'),
    filename: 'js/[name]-[hash].js',
  },

  module: {
    rules: [
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
  },
};
