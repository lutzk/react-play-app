import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import ApiClient from '../helpers/ApiClient';
import { App } from './containers/App/App';
import { createReduxStore } from './redux/store/createReduxStore';

declare var __DEVTOOLS__: any;
declare var __DEVELOPMENT__: any;
declare global {
  interface Window {
    __data: any;
    React: any;
  }
}

const client = new ApiClient();
const preloadedState = window.__data;
const { store /* , thunk */ } = createReduxStore({
  client,
  preloadedState,
});

const rootDomNode = document.getElementById('root');
const render = (App: any, store: any, hydrate = true) => {
  // eslint-disable-line
  let dom = null;
  const renderFn = hydrate ? ReactDOM.hydrate : ReactDOM.render;
  const app = (
    <Provider store={store}>
      <App />
    </Provider>
  );

  dom = renderFn(app, rootDomNode);

  return dom;
};

const renderDevStuff = () => {
  if (__DEVELOPMENT__) {
    window.React = React;

    if (__DEVTOOLS__) {
      const DevTools = require('./containers/DevTools/DevTools').default;
      const devToolsDest = document.createElement('div');
      window.document.body.insertBefore(devToolsDest, null);
      ReactDOM.render(
        <Provider store={store} key="devToolsProvider">
          <DevTools />
        </Provider>,
        devToolsDest,
      );
    }
  }
};

render(App, store);
renderDevStuff();

if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept('./containers/App/App', () => {
    render(App, store, false);
  });
}
// initCacheWorker(t).then((a) => {
