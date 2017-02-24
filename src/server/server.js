import Express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom/server';
import compression from 'compression';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { match, createMemoryHistory } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import { ApiClient, Html, logJSON } from '../helpers';
import appConfig from '../config/appConfig';
import getRoutes from '../routes';
import createStore from '../redux/create';
import devAssetsMiddleware from './middleware/devAssetsMiddleware';
import { loadDevRoverManifest } from './middleware/loadDevRoverManifest';
import { faviconReqKiller } from './middleware/faviconReqKiller';

injectTapEventPlugin();

const app = new Express();
const server = new http.Server(app);
const doctype = '<!doctype html>\n';
const staticDir = path.join(process.cwd(), './static');
const corsConfig = {
  // origin: 'https://api.nasa.gov/',
  origin: 'http://localhost/',
  methods: 'GET',
};

const startServer = (assets) => {

  let assetsObj = assets;

  if (global.__DEVELOPMENT__) {
    app.use(devAssetsMiddleware());
    app.use(loadDevRoverManifest());
  }

  app
    .use(cors(corsConfig))
    .use(compression())
    .use(faviconReqKiller())
    .use(Express.static(staticDir))
    .use((req, res) => {
      const client = new ApiClient(req);
      const history = createMemoryHistory(req.originalUrl);
      const store = createStore(history, client);
      const routes = getRoutes(store);

      const renderHtml = (_store, _assets, _component) =>
        ReactDOM.renderToString(
          <Html
            store={_store}
            assets={_assets}
            component={_component} />);

      const hydrateOnClient = _assets =>
        res.send(
          `${doctype}${ReactDOM.renderToString(
            <Html store={store} assets={_assets} />)}`
        );

      // in dev
      if (global.__DEVELOPMENT__ && res.locals.devAssets) {
        assetsObj = res.locals.devAssets;
      }

      if (global.__DISABLE_SSR__) {
        hydrateOnClient(assetsObj);
        return;
      }

      match(
        { history, routes, location: req.originalUrl },
        (error, redirectLocation, renderProps) => {
          if (error) {
            logJSON(error, 'error');
            res.status(500);
            hydrateOnClient(assetsObj);

          } else if (redirectLocation) {
            res.redirect(`${redirectLocation.pathname}${redirectLocation.search}`);

          } else if (renderProps) {

            loadOnServer({ ...renderProps, store, helpers: { client } })
            .then(() => {
              const component = (
                <Provider store={store} key="appProvider">
                  <ReduxAsyncConnect { ...renderProps } />
                </Provider>
              );
              const html = `${doctype}${renderHtml(store, assetsObj, component)}`;
              res.status(200);
              res.send(html);
            }).catch((err) => {
              logJSON({ catchError: err }, 'error');
            });
          } else {
            res.status(404).send('Not found');
          }
        });
    });

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
