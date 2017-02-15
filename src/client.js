import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';
import { Provider } from 'react-redux';
import { useScroll } from 'react-router-scroll';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { ReduxAsyncConnect } from 'redux-connect';
import { syncHistoryWithStore } from 'react-router-redux';
import { Router, browserHistory, applyRouterMiddleware, match } from 'react-router';
import { AppContainer } from 'react-hot-loader';


import getRoutes from './routes';
import ApiClient from './helpers/ApiClient';
import createStore from './redux/create';

const client = new ApiClient();
const store = createStore(browserHistory, client, window.__data);
const syncHistory = syncHistoryWithStore(browserHistory, store);
const rootDomNode = document.getElementById('content');
const routerRoutes = getRoutes(store);
const asyncConnectRender = applyRouterMiddleware(useScroll());

const renderRouter = props =>
  <ReduxAsyncConnect
    { ...props }
    helpers={{ client }}
    filter={ item => !item.deferred }
    render={ asyncConnectRender } />;

const render = (routes, renderProps) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store} key={`${Math.random()}`}>
        <Router
          render={ renderRouter }
          history={ syncHistory }
          { ...renderProps }>
          { routes }
        </Router>
      </Provider>
    </AppContainer>,
    rootDomNode
  );
};

const renderDevStuff = () => {
  if (__DEVELOPMENT__) {
    window.React = React; // enable debugger

    if (!rootDomNode || !rootDomNode.firstChild || !rootDomNode.firstChild.attributes || !rootDomNode.firstChild.attributes['data-react-checksum']) {
      console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
    }
  }

  if (__DEVTOOLS__) {
    const DevTools = require('./containers/DevTools/DevTools').default;
    const devToolsDest = document.createElement('div');
    window.document.body.insertBefore(devToolsDest, null);
    ReactDOM.render(
      <Provider store={store} key="provider">
        <DevTools />
      </Provider>,
      devToolsDest
    );
  }
};

injectTapEventPlugin();
FastClick.attach(document.body);

match(
  { history: syncHistory, routes: routerRoutes },
  (error, redirectLocation, renderProps) => {
    render(routerRoutes, renderProps);
    renderDevStuff();
    // console.log('match');
    // console.log(module.hot);
    if (module.hot) {
      console.log('module.hot:1');
      module.hot.accept('./routes', () => {
        console.log('module.hot:2');
        // const getNextRoutes = require('./routes').default;
        render(getRoutes(store), renderProps);
      });
    }
  }
);
