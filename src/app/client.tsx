import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import ApiClient from '../helpers/ApiClient';
import { App } from './containers/App/App';
import { createReduxStore } from './redux/store/createReduxStore';

const client = new ApiClient();
const preloadedState = window.__data;
const { store /* , thunk */ } = createReduxStore({
  client,
  preloadedState,
});

const rootDomNode = document.getElementById('root');
const render = (App: any, store: any, hydrate = true) => {
  const renderFn = hydrate ? ReactDOM.hydrate : ReactDOM.render;
  const app = (
    <Provider store={store}>
      <App />
    </Provider>
  );

  return renderFn(app, rootDomNode);
};

render(App, store);

if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept('./containers/App/App', () => {
    render(App, store, false);
  });
}
// initCacheWorker(t).then((a) => {
