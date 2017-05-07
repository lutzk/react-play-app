import Perf from 'react-addons-perf';
import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';
import { Provider } from 'react-redux';
import { useScroll } from 'react-router-scroll';
import { AppContainer as HotReloader } from 'react-hot-loader';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { ReduxAsyncConnect } from 'redux-connect';
import { syncHistoryWithStore } from 'react-router-redux';
import { Router, browserHistory, applyRouterMiddleware, match } from 'react-router';

import { getRoutes } from './routes';
import { ApiClient } from '../helpers/ApiClient';
import { createStore } from './redux/create';

const client = new ApiClient();
const store = createStore({
  client,
  history: browserHistory,
  preloadedState: window.__data,
});

const history = syncHistoryWithStore(browserHistory, store);
const rootDomNode = document.getElementById('root');
const routes = getRoutes(store);
const asyncConnectRender = applyRouterMiddleware(useScroll());

const renderRouter = props =>
  <ReduxAsyncConnect
    { ...props }
    filter={ item => !item.deferred }
    render={ asyncConnectRender } />;

const render = (_routes, renderProps) => {
  const App = (
    <Provider store={store} key="appProvider">
      <Router
        render={ renderRouter }
        history={ history }
        { ...renderProps }>
        { _routes }
      </Router>
    </Provider>);

  let dom = null;

  if (__DEVELOPMENT__) {
    dom = ReactDOM.render(
      <HotReloader>
        {App}
      </HotReloader>,
      rootDomNode
    );
  } else {
    dom = ReactDOM.render(App, rootDomNode);
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

match(
  { history, routes },
  (error, redirectLocation, renderProps) => {
    render(routes, renderProps);

    if (__DEVELOPMENT__) {
      renderDevStuff();

      if (module.hot) {
        module.hot.accept('./routes',
          () => render(getRoutes(store), renderProps));
      }
    }
  }
);
