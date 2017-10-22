import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';
import { Provider } from 'react-redux';
import { AppContainer as HotReloader } from 'react-hot-loader';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { ApiClient } from '../helpers/ApiClient';
import { App } from './containers/App/App';
import { createReduxStore } from './redux/store/createReduxStore';

const client = new ApiClient();
const preloadedState = window.__data;
const { store /* , thunk */ } = createReduxStore({
  client,
  preloadedState,
});

const rootDomNode = document.getElementById('root');
const render = (App, store) => {// eslint-disable-line
  let dom = null;
  const app = (
    <Provider store={store}>
      <App />
    </Provider>);

  if (__DEVELOPMENT__) {
    dom = ReactDOM.hydrate(
      <HotReloader>
        {app}
      </HotReloader>,
      rootDomNode
    );

  } else {
    dom = ReactDOM.hydrate(app, rootDomNode);
  }

  return dom;
};

const renderDevStuff = () => {
  if (__DEVELOPMENT__) {

    window.React = React;

    if (__DEVTOOLS__) {
      const DevTools = require('./containers/DevTools/DevTools').default;
      const devToolsDest = document.createElement('div');
      window.document.body.insertBefore(devToolsDest, null);
      ReactDOM.hydrate(
        <Provider store={store} key="devToolsProvider">
          <DevTools />
        </Provider>,
        devToolsDest
      );
    }
  }
};

injectTapEventPlugin();
FastClick.attach(document.body);

render(App, store);
renderDevStuff();

if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept('./containers/App/App', () => {
    const hotApp = require('./containers/App/App').ReduxApp;
    render(hotApp, store);
  });
}
// initCacheWorker(t).then((a) => {
