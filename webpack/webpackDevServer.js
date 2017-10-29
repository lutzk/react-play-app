require('../setEnv');
const Express = require('express');
const webpack = require('webpack');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');

const appConfig = require('../src/config/config');
const webpackConfig = require('./webpackConfig.js');

const clientConfig = webpackConfig('dev.client');
const compiler = webpack(clientConfig);
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
  context: clientConfig.context,
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
  publicPath: clientConfig.output.publicPath,
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:3010',
  },
  stats: { chunks: false, colors: true },
  serverSideRender: true
};

const app = new Express();

app
  .use(webpackDevMiddleware(compiler, serverOptions))
  .use(webpackHotMiddleware(compiler))
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
