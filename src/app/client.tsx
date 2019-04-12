import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ApiClient } from '../helpers/ApiClient';
import { persistentStore } from '../redux-pouchdb-plus/src/index';
import App from './containers/App/App';
import { createReduxStore } from './redux/store/createReduxStore';

const client = new ApiClient();
const preloadedState = window.__data;
const { store: AppStore /* , thunk */ } = createReduxStore({
  client,
  preloadedState,
  persistentStore: persistentStore(),
});

const rootDomNode = document.getElementById('root');
const render = (App, store = AppStore, hydrate = true) => {
  const renderFn = hydrate ? ReactDOM.hydrate : ReactDOM.render;
  const app = (
    <Provider store={store}>
      <App />
    </Provider>
  );

  return renderFn(app, rootDomNode);
};

render(App, AppStore);

if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept(
    // e => console.error('errorr', e),
    ['./redux/store/createReduxStore', '../redux-pouchdb-plus/src/index'],
    () => {
      // render(App, store, false);
    },
  );
}
