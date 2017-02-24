/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';

const context = path.resolve(__dirname, '../');

export default {
  context,

  entry: {
    main: path.resolve(__dirname, '../js/index.jsx'),
  },

  output: {
    path: path.resolve(__dirname, '../bundles/'),
    filename: 'js/[name].js',
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
        postcss: [autoprefixer],
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
