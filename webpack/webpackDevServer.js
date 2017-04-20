require('../setEnv');
const Express = require('express');
const webpack = require('webpack');
const webpackConfig = require('./webpackConfig.js')('dev.client');
const appConfig = require('../src/config/config');

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
  context: webpackConfig.context,
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
  contentBase: `http://${appConfig.host}:${appConfig.devAssetServerPort}`,
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
  .get(appConfig.ssrAssetsRoute, (req, res, next) => {
    const json = res.locals.webpackStats.toJson(StatsToJsonConfig);
    res.send({
      publicPath: json.publicPath,
      assetsByChunkName: json.assetsByChunkName
    });
    next();
  })
  .listen(
    appConfig.devAssetServerPort,
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.info('==> Webpack assets dev server listening on port %s', appConfig.devAssetServerPort);
      }
    }
);
