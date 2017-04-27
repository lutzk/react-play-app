import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { renderApp } from './middleware/renderApp';
import { port, host } from '../config/appConfig';
import { proxyRouter } from './routers/proxyRouter';
import { getCouchDocs } from './middleware/getCouchDocs';
import { errorHandler } from './middleware/errorHandler';
import { faviconReqKiller } from './middleware/faviconReqKiller';
import { devAssetsMiddleware } from './middleware/devAssetsMiddleware';

const app = express();
const staticDir = path.join(process.cwd(), './static');

injectTapEventPlugin();

export const startServer = ({ serverAssets } = {}) => { // eslint-disable-line

  if (!port) {
    throw Error('ERROR: No PORT environment variable has been specified');
  }

  if (global.__DEVELOPMENT__) {
    app
      .use(faviconReqKiller())
      .use(devAssetsMiddleware());
  }

  app
    .use(compression())
    .use(proxyRouter)
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(faviconReqKiller())
    .use(express.static(staticDir))
    .use(getCouchDocs())
    .use(renderApp({ serverAssets }))
    .use(errorHandler())
    .listen(port, (err) => {
      if (err) {
        console.log('__start app server error', err);
        throw Error(err);
      } else {
        console.info(`server up and running on: //${host}:${port}`);
      }
    });
};
