import path from 'path';
import Express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { port, host, apiBase } from '../config/appConfig';
import apiProxy from './middleware/apiProxy';
import renderApp from './middleware/renderApp';
import devAssetsMiddleware from './middleware/devAssetsMiddleware';
import { faviconReqKiller } from './middleware/faviconReqKiller';
import { getCouchDocs } from './middleware/getCouchDocs';

const app = new Express();
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
    .use(apiBase, apiProxy())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(faviconReqKiller())
    .use(Express.static(staticDir))
    .use(getCouchDocs())
    .use(renderApp({ serverAssets }))
    .listen(port, (err) => {
      if (err) {
        throw Error(err);
      } else {
        console.info(`server up and running on: //${host}:${port}`);
      }
    });
};
