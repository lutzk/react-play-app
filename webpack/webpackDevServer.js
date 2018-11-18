import Express from 'express';
import webpack from 'webpack';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackDevMiddleware from 'webpack-dev-middleware';

import { config as appConfig } from '../src/config/config';
import webpackConfig from './webpackConfig.js';

const clientConfig = webpackConfig('dev.client');
const compiler = webpack(clientConfig);

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
  stats: { colors: true },
  serverSideRender: true,
};

const app = new Express();

app
  .use(webpackDevMiddleware(compiler, serverOptions))
  .use(webpackHotMiddleware(compiler))
  .get(appConfig.ssrAssetsRoute, (req, res, next) => {
    const json = res.locals.webpackStats.toJson();
    res.send(json);
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
