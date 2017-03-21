import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import PouchDB from 'pouchdb';
import { persistentStore } from 'redux-pouchdb';
import createMiddleware from './middleware/clientMiddleware';

export default function createStore({ history, client, preloadedState, remoteCouch }) {
  let db = null;
  let finalCreateStore;
  const reduxRouterMiddleware = routerMiddleware(history);
  const middleware = [
    createMiddleware(client),
    reduxRouterMiddleware,
    thunkMiddleware,
  ];

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    db = new PouchDB('earth', { revs_limit: 100, auto_compaction: true });
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
      applyMiddleware(...middleware)
    )(_createStore);
  }

  const reducer = require('./modules/reducer').default;
  const store = finalCreateStore(reducer, preloadedState);

  if (__CLIENT__) {
    db.sync(remoteCouch, {
      live: true,
      retry: true,
    })
    // .on('active', () => console.log('__ACTIVE'))
    // .on('change', () => console.log('__CHANGE'))
    // .on('complete', () => console.log('__COMPLETE'))
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
