import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import flushChunks from 'webpack-flush-chunks';
import { NOT_FOUND } from 'redux-first-router';
import { flushChunkNames } from 'react-universal-component/server';
// import { END } from 'redux-saga';

import { ApiClient } from '../../helpers/ApiClient';
import { Html /* , logJSON */ } from '../../helpers';
import { asyncWrap as aw } from '../../helpers/utils';
import { App } from '../../app/containers/App/App';
import { createReduxStore } from '../../app/redux/store/createReduxStore';

require('../../helpers/reactTapEventPlugin');


const doctype = '<!doctype html>\n';

// serverAssets => stats
const renderApp = (/* { serverAssets } = {} */) => aw(async (req, res, next) => {

  // let assets = serverAssets;
  const client = new ApiClient(req);
  const preloadedState = res.preloadedState || {};

  const reqPath = [req.path];
  const { store, thunk /* , rootTask */ } = createReduxStore({
    client,
    reqPath,
    preloadedState,
  });

  // if (__DEVELOPMENT__ && res.locals.devAssets) {
  //   assets = res.locals.devAssets;
  // }

  const renderHtml = ({ app, store, assets }) =>// eslint-disable-line
    `${doctype}${renderToString((<Html
      app={ app }
      store={ store }
      assets={ assets } />
  ))}`;

  const createApp = (App, store) =>// eslint-disable-line
    renderToString(
      (<Provider store={store}>
        <App />
      </Provider>));

  const doesRedirect = ({ kind, pathname }, res) => {// eslint-disable-line
    if (kind === 'redirect') {
      res.redirect(302, pathname);
      return true;
    }
  };

  let location = store.getState().location;
  if (doesRedirect(location, res)) {
    return false;
  }

  await thunk(store);

  location = store.getState().location;
  if (doesRedirect(location, res)) {
    return false;
  }

  // universal saga handling
  // start sagas eg dispatch some
  // store.dispatch(END);
  // await rootTask.done;

  const app = createApp(App, store);
  const chunkNames = flushChunkNames();
  const { Js, publicPath, cssHashRaw, stylesheets } = flushChunks(
    res.locals.clientStats,
    {
      chunkNames,
      before: ['runtime', 'vendor'],
      after: ['main'],
    });

  const assets = {
    Js, publicPath, cssHashRaw, stylesheets,
  };

  const html = renderHtml({ app, store, assets });
  const resStatus = location.type === NOT_FOUND ? 404 : 200;

  return res
    .status(resStatus)
    .send(html)
    .end();
});

export { renderApp };
