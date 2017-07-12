import Perf from 'react-addons-perf';
import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';
import { Provider } from 'react-redux';
import { AppContainer as HotReloader } from 'react-hot-loader';
import injectTapEventPlugin from 'react-tap-event-plugin';
import createHistory from 'history/createBrowserHistory';

import { ApiClient } from '../helpers/ApiClient';
import { ReduxApp as App } from './containers/App/App';
import { createReduxStore } from './redux/reduxRouterFirst/createReduxStore';

const client = new ApiClient();
const history = createHistory();
const preloadedState = window.__data;
const { store, thunk } = createReduxStore({
  client,
  history,
  preloadedState
});

const rootDomNode = document.getElementById('root');
const render = (App, store) => {
  let dom = null;
  const app = (
    <Provider store={store}>
      <App />
    </Provider>);

  if (__DEVELOPMENT__) {
    dom = ReactDOM.render(
      <HotReloader>
        {app}
      </HotReloader>,
      rootDomNode
    );

  } else {
    dom = ReactDOM.render(app, rootDomNode);
  }

  return dom;
};

const renderDevStuff = () => {
  if (__DEVELOPMENT__) {

    window.React = React;
    window.perf = Perf;// enable debugger

    if (!rootDomNode || !rootDomNode.firstChild || !rootDomNode.firstChild.attributes || !rootDomNode.firstChild.attributes['data-react-checksum']) {
      console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
    }

    if (__DEVTOOLS__) {
      const DevTools = require('./containers/DevTools/DevTools').default;
      const devToolsDest = document.createElement('div');
      window.document.body.insertBefore(devToolsDest, null);
      ReactDOM.render(
        <Provider store={reduxStore} key="devToolsProvider">
          <DevTools />
        </Provider>,
        devToolsDest
      );
    }
  }
};

render(App, store)
renderDevStuff();
if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept('./containers/App/App', () => {
    const hotApp = require('./containers/App/App').ReduxApp;
    reduxRender(hotApp, store);
  });
}
// initCacheWorker(t).then((a) => {
