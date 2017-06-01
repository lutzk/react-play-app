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

require('../../helpers/reactTapEventPlugin');


const renderApp = ({ serverAssets } = {}) => aw(async (req, res, next) => {

  let assets = serverAssets;
  const client = new ApiClient(req);
  const history = createMemoryHistory(req.originalUrl);
  const preloadedState = res.preloadedState || {};

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
        <Html store={store} assets={_assets} />)}`);

  // in dev
  if (__DEVELOPMENT__ && res.locals.devAssets) {
    assets = res.locals.devAssets;
  }

  match(
    { history, routes, location: req.originalUrl },
    (error, redirectLocation, renderProps) => {
      if (error) {
        logJSON(error, 'error');
        res.status(500);
        hydrateOnClient(assets);

      } else if (redirectLocation) {
        res.redirect(`${redirectLocation.pathname}${redirectLocation.search}`);

      } else if (renderProps) {
        loadOnServer({ ...renderProps, store })
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
        .catch(next);
      } else {
        // res.redirect('/404');
        res.status(404).send('Not found');
      }
    });
});

export { renderApp };
