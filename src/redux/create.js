import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import PouchDB from 'pouchdb';
import { persistentStore } from 'redux-pouchdb';
import createMiddleware from './middleware/clientMiddleware';

export default function createStore(history, client, data) {
  let db = null;
  const remoteDB = new PouchDB('http://127.0.0.1:5984/mars');
  const reduxRouterMiddleware = routerMiddleware(history);
  const middleware = [createMiddleware(client), reduxRouterMiddleware, thunkMiddleware];
  let finalCreateStore;

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    db = new PouchDB('earth');
    const DevTools = require('../containers/DevTools/DevTools').default;
    finalCreateStore = compose(
      persistentStore(db),
      applyMiddleware(...middleware),
      DevTools.instrument()
    )(_createStore);

  } else if (__CLIENT__) {
    finalCreateStore = compose(
      applyMiddleware(...middleware)
    )(_createStore);

  } else {
    finalCreateStore = compose(
      // persistentStore(remoteDB),
      applyMiddleware(...middleware)
    )(_createStore);
  }

  const reducer = require('./modules/reducer').default;
  const store = finalCreateStore(reducer, data);

  if (__CLIENT__) {
    db.sync(remoteDB, {
      live: true,
      retry: true,
    })
    .on('active', () => console.log('__ACTIVE'))
    .on('change', () => console.log('__CHANGE'))
    .on('complete', () => console.log('__COMPLETE'))
    .on('error', e => console.log('__ERROR', e));
  }

  // reduxRouterMiddleware.listenForReplays(store);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer').default);
    });
  }

  return store;
}
