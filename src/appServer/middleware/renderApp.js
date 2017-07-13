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

const renderApp = ({ serverAssets } = {}) => aw(async (req, res, next) => {

  let assets = serverAssets;
  const client = new ApiClient(req);
  const doctype = '<!doctype html>\n';
  const preloadedState = res.preloadedState || {};
  const history = createHistory({
    initialEntries: [req.originalUrl],
  });

  const { store, thunk /* , rootTask */ } = createReduxStore({
    client,
    history,
    preloadedState,
  });

  if (__DEVELOPMENT__ && res.locals.devAssets) {
    assets = res.locals.devAssets;
  }

  const createApp = (App, _store) =>// eslint-disable-line
    (<Provider store={_store}>
      <App />
    </Provider>);

  const doesRedirect = ({ kind, pathname }, _res) => {// eslint-disable-line
    if (kind === 'redirect') {
      _res.redirect(302, pathname);
      return true;
    }
  };

  let location = store.getState().location;
  if (doesRedirect(location, res)) {
    return false;
  }

  await thunk(store); // .then((e) => console.log('__SERVER_THUNK__', e)); // THE PAYOFF BABY!

  location = store.getState().location; // remember: state has now changed
  if (doesRedirect(location, res)) {
    return false; // only do this again if ur thunks have redirects
  }

  const resStatus = location.type === NOT_FOUND ? 404 : 200;
  const reduxApp = createApp(App, store);

  // universal saga handling
  // const actionCreator = await reduxApp.props.children.type.fetchData();
  // store.dispatch(actionCreator());
  // store.dispatch(END);
  // await rootTask.done;
  const appString = await renderToStringWithData(reduxApp, store);
  // console.dir(reduxApp.props.children.type.WrappedComponent);
  // const appString = ReactDOM.renderToString(reduxApp);
  const chunkNames = flushChunkNames();
  const { Js, Styles, cssHashRaw } = flushChunks(res.locals.clientStats, {
    chunkNames,
    before: ['manifest', 'vendor'],
    after: ['main'],
    publicPath: 'http://localhost:3011/dist/assets',
    outputPath: '/Users/jonny/Desktop/do/static/dist/assets', // required!
  });
  const reduxHtml = `${doctype}${renderToString(
    (<Html
      extra={{ Js, Styles, cssHashRaw }}
      store={ store }
      assets={ assets }
      component={ appString } />
  ))}`;

  return res
    .status(resStatus)
    .send(reduxHtml);
});

export { renderApp };
