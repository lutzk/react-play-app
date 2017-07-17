import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import createHistory from 'history/createMemoryHistory';
import flushChunks from 'webpack-flush-chunks';
import { NOT_FOUND } from 'redux-first-router';
import { flushChunkNames } from 'react-universal-component/server';
// import { END } from 'redux-saga';

import { ApiClient } from '../../helpers/ApiClient';
import { Html /* , logJSON */ } from '../../helpers';
import { asyncWrap as aw } from '../../helpers/utils';
import { ReduxApp as App } from '../../app/containers/App/App';
import { createReduxStore } from '../../app/redux/reduxRouterFirst/createReduxStore';
import { renderToStringWithData } from './render';

require('../../helpers/reactTapEventPlugin');


const doctype = '<!doctype html>\n';

// serverAssets => stats
const renderApp = (/* { serverAssets } = {} */) => aw(async (req, res, next) => {

  // let assets = serverAssets;
  const client = new ApiClient(req);
  const preloadedState = res.preloadedState || {};
  const history = createHistory({
    initialEntries: [req.originalUrl],
  });

  const { store, thunk /* , rootTask */ } = createReduxStore({
    client,
    history,
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
    (<Provider store={store}>
      <App />
    </Provider>);

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

  await thunk(store).then(r => console.log('__SERVER_THUNK__', r));

  location = store.getState().location;
  if (doesRedirect(location, res)) {
    return false;
  }

  const resStatus = location.type === NOT_FOUND ? 404 : 200;
  const reduxApp = createApp(App, store);

  // universal saga handling
  // start sagas eg dispatch some
  // store.dispatch(END);
  // await rootTask.done;
  const app = await renderToStringWithData(reduxApp, store);
  const chunkNames = flushChunkNames();
  const { Js, publicPath, cssHashRaw, stylesheets } = flushChunks(
    res.locals.clientStats,
    {
      chunkNames,
      before: ['manifest', 'vendor'],
      after: ['main'],
    // publicPath: 'http://localhost:3011/dist/assets',
    // outputPath: '/Users/jonny/Desktop/do/static/dist/assets', // required!
    });

  const assets = {
    Js, publicPath, cssHashRaw, stylesheets,
  };

  const html = renderHtml({ app, store, assets });

  return res
    .status(resStatus)
    .send(html);
});

export { renderApp };
