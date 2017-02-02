const Express = require('express');
const webpack = require('webpack');

const config = require('./webpackCommons').webpackCommons;
const webpackConfig = require('./devClientConfig');
const compiler = webpack(webpackConfig);

const serverOptions = {
  contentBase: 'http://' + config.host + ':' + config.assetServerPort,
  quiet: true,
  noInfo: false,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: { colors: true }
};

const app = new Express();

app.use(require('webpack-dev-middleware')(compiler, serverOptions));
app.use(require('webpack-hot-middleware')(compiler));

app.listen(config.assetServerPort, function onAppListening(err) {
  if (err) {
    console.error(err);
  } else {
    console.info('==> Webpack asset dev server listening on port %s', config.assetServerPort);
  }
});
