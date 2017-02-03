import Express from 'express';
import http from 'http';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom/server';
import compression from 'compression';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { match, createMemoryHistory } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';

import { ApiClient, Html, logJSON } from './helpers';
import config from './appConfig';
import getRoutes from './routes';
import createStore from './redux/create';
import devAssetsMiddleware from './devAssetsMiddleware';

injectTapEventPlugin();

const app = new Express();
const server = new http.Server(app);
const doctype = '<!doctype html>\n';

const startServer = (assets) => {

  let assetsObj = assets;

  app.use(compression())
  .use(Express.static(path.join(process.cwd(), './static')))
  .use(devAssetsMiddleware())
  .use((req, res) => {

    const client = new ApiClient(req);
    const history = createMemoryHistory(req.originalUrl);
    const store = createStore(history, client);
    const routes = getRoutes(store);

    // in dev
    if (req.devAssets) {
      assetsObj = req.devAssets;
    }

    const hydrateOnClient = (_assets) => {
      return res.send(
        `${doctype}${ReactDOM.renderToString(
          <Html store={store} assets={_assets} />)}`
      );
    };

    const renderHtml = (_store, _assets, _component) => {
      return ReactDOM.renderToString(
        <Html
          store={_store}
          assets={_assets}
          component={_component} />);
    };

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
              <Provider store={store} key="provider">
                <ReduxAsyncConnect { ...renderProps } />
              </Provider>
            );
            const html = `${doctype}${renderHtml(store, assetsObj, component)}`;
            res.status(200);
            res.send(html);
          }).catch(err => logJSON(err));
        } else {
          res.status(404).send('Not found');
        }
      });
  });

  if (config.port) {
    server.listen(config.port, (err) => {
      if (err) {
        logJSON(err, 'error');
      }
      console.info('Open http://%s:%s in a browser.', config.host, config.port);
    });
  } else {
    console.error('ERROR: No PORT environment variable has been specified');
  }
};

export default startServer;
