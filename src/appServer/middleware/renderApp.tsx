import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { flushChunkNames } from 'react-universal-component/server';
import { NOT_FOUND } from 'redux-first-router';
import flushChunks from 'webpack-flush-chunks';
// import { END } from 'redux-saga';

import { Handler } from 'express';
import App from '../../app/containers/App/App';
import { MyThunkDispatch } from '../../app/redux/modules/types';
import { loadAuth } from '../../app/redux/modules/user';
import { createReduxStore } from '../../app/redux/store/createReduxStore';
import { ApiClient } from '../../helpers/ApiClient';
import Html from '../../helpers/Html';
import { asyncWrap as aw } from '../../helpers/utils';

const doctype = '<!doctype html>\n';

// serverAssets => stats
const renderApp = (): Handler =>
  /* { serverAssets } = {} */ aw(async (req, res, next) => {
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
    const renderHtml = ({ app, store, assets }) =>
      `${doctype}${renderToString(
        <Html app={app} store={store} assets={assets} />,
      )}`;

    const createApp = (App, store) =>
      renderToString(
        <Provider store={store}>
          <App />
        </Provider>,
      );

    const doesRedirect = ({ kind, pathname }, res) => {
      if (kind === 'redirect') {
        res.redirect(302, pathname);
        return true;
      }
    };

    let location = store.getState().location;
    if (doesRedirect(location, res)) {
      return false;
    }

    await (store.dispatch as MyThunkDispatch)(loadAuth());
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
    const { Js, publicPath, stylesheets } = flushChunks(
      res.locals.clientStats,
      { chunkNames },
    );

    const assets = {
      Js,
      publicPath,
      stylesheets,
    };

    const html = renderHtml({ app, store, assets });
    const resStatus = location.type === NOT_FOUND ? 404 : 200;

    return res
      .status(resStatus)
      .send(html)
      .end();
  });

export { renderApp };
