import cors from 'cors';
import http from 'http';
import path from 'path';
import Express from 'express';
import PouchDB from 'pouchdb';
import compression from 'compression';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { logJSON } from '../helpers';
import appConfig from '../config/appConfig';
import renderApp from './middleware/renderApp';
import devAssetsMiddleware from './middleware/devAssetsMiddleware';
import { loadDevRoverManifest } from './middleware/loadDevRoverManifest';
import { faviconReqKiller } from './middleware/faviconReqKiller';
import { getCouchDocs } from './middleware/getCouchDocs';

injectTapEventPlugin();

const app = new Express();
const server = new http.Server(app);
const remoteCouch = new PouchDB('http://127.0.0.1:5984/mars');
const staticDir = path.join(process.cwd(), './static');
const corsConfig = {
  // origin: 'https://api.nasa.gov/',
  origin: 'http://localhost/',
  methods: 'GET',
};

const startServer = (serverAssets = {}) => {

  if (global.__DEVELOPMENT__) {
    app
      .use(faviconReqKiller())
      .use(devAssetsMiddleware())
      .use(loadDevRoverManifest());
  }

  app
    .use(faviconReqKiller())
    .use(compression())
    .use(Express.static(staticDir))
    .use(cors(corsConfig))
    .use(loadDevRoverManifest())
    .use(getCouchDocs(remoteCouch))
    .use(renderApp({ serverAssets, remoteCouch }));

  if (appConfig.port) {
    server.listen(appConfig.port, (err) => {
      if (err) {
        logJSON(err, 'error');
      }
      console.info('Open http://%s:%s in a browser.', appConfig.host, appConfig.port);
    });
  } else {
    console.error('ERROR: No PORT environment variable has been specified');
  }
};

export default startServer;
