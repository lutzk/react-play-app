const Express = require('express');
const webpack = require('webpack');
const config = require('./webpackCommons').webpackCommons;
const webpackConfig = require('./devClientConfig');

const compiler = webpack(webpackConfig);

const StatsToJsonConfig = {
  assets: true,
  entrypoints: false,
  reasons: false,
  chached: false,
  children: false,
  chunks: false,
  chunkModules: false,
  chunkOrigins: false,
  chunksSort: false,
  context: config.context,
  colors: false,
  errors: false,
  errorDetails: false,
  hash: false,
  modules: false,
  source: false,
  timings: false,
  version: false,
  warnings: false
};

const serverOptions = {
  contentBase: `http://${config.host}:${config.assetServerPort}`,
  quiet: false,
  noInfo: false,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  headers: { 'Access-Control-Allow-Origin': '*' },
  stats: { chunks: false, colors: true },
  serverSideRender: true
};

const app = new Express();

app
  .use(require('webpack-dev-middleware')(compiler, serverOptions))
  .use(require('webpack-hot-middleware')(compiler))
  .get('/webpack-assets', (req, res, next) => {
    const json = res.locals.webpackStats.toJson(StatsToJsonConfig);
    res.send({
      publicPath: json.publicPath,
      assetsByChunkName: json.assetsByChunkName
    });
    next();
  })
  .listen(
    config.assetServerPort,
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.info('==> Webpack asset dev server listening on port %s', config.assetServerPort);
      }
    }
);
