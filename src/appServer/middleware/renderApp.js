import React from 'react';
import ReactDOM from 'react-dom/server';
import { Provider } from 'react-redux';
import { match, createMemoryHistory } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import { Html, logJSON } from '../../helpers';
import { asyncWrap as aw } from '../../helpers/utils';
import { ApiClient } from '../../helpers/ApiClient';
import { getRoutes } from '../../app/routes';
import { createStore } from '../../app/redux/create';

const renderApp = ({ serverAssets } = {}) => aw(async (req, res, next) => {

  let assets = serverAssets;
  const client = new ApiClient(req);
  const history = createMemoryHistory(req.originalUrl);
  const preloadedState = res.preloadedState || {};
  // console.log('preloadedState');
  // console.log(preloadedState.roverView);
  if (preloadedState.roverView) {
    console.log('preloadedState 2');
    preloadedState.roverView.prefetched = true;
  }
  const store = createStore({
    client,
    history,
    preloadedState,
  });

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

        loadOnServer({ ...renderProps, store /* , helpers: { client } */ })
        .then(() => {
          const component = (
            <Provider store={store} key="appProvider">
              <ReduxAsyncConnect { ...renderProps } />
            </Provider>
          );
          const html = `${doctype}${renderHtml(store, assets, component)}`;
          res.status(200);
          res.send(html);
        })
        // .catch((err) => {
        //   logJSON({ catchError: err }, 'error');
        // });
        .catch(next);
      } else {
        res.status(404).send('Not found');
      }
    });
});

export { renderApp };
