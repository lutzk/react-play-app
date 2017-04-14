import React from 'react';
import ReactDOM from 'react-dom/server';
import { Provider } from 'react-redux';
import { match, createMemoryHistory } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import { ApiClient, Html, logJSON } from '../../helpers';
import getRoutes from '../../routes';
import createStore from '../../redux/create';
import { timer } from '../../helpers/logTiming';

const renderApp = ({ serverAssets } = {}) => (req, res, next) => { // eslint-disable-line

  let assets = serverAssets;
  const client = new ApiClient(req);
  const history = createMemoryHistory(req.originalUrl);
  const preloadedState = res.preloadedState || {};
  const store = createStore({
    client,
    history,
    preloadedState,
  });

  const startTime = timer.start();
  const routes = getRoutes(store);
  const doctype = '<!doctype html>\n';

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
    assets = res.locals.devAssets;
  }

  if (global.__DISABLE_SSR__) {
    hydrateOnClient(assets);
    return;
  }

  match(
    { history, routes, location: req.originalUrl },
    (error, redirectLocation, renderProps) => {
      if (error) {
        logJSON(error, 'error');
        res.status(500);
        hydrateOnClient(assets);
        next();

      } else if (redirectLocation) {
        res.redirect(`${redirectLocation.pathname}${redirectLocation.search}`);
        next();

      } else if (renderProps) {

        loadOnServer({ ...renderProps, store, helpers: { client } })
        .then(() => {
          const component = (
            <Provider store={store} key="appProvider">
              <ReduxAsyncConnect { ...renderProps } />
            </Provider>
          );
          const html = `${doctype}${renderHtml(store, assets, component)}`;
          res.status(200);
          res.send(html);
          timer.stop(startTime, 'renderApp');
          next();
        })
        .catch((err) => {
          logJSON({ catchError: err }, 'error');
          next();
        });
      } else {
        res.status(404).send('Not found');
        next();
      }
    });
};

export default renderApp;
