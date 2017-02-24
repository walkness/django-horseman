/* eslint-disable */

require('babel-core/register');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./horseman/horsemanadmin/frontend/webpack/dev.config.babel').default;

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  stats: {
    colors: true
  }
}).listen(3000, '0.0.0.0', function (err) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at 0.0.0.0:3000');
});
