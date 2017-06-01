import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import { clientMiddleware } from './middleware/clientMiddleware';

function createStore({ history, client, preloadedState }) { // eslint-disable-line
  let DevTools;
  let persistentStore;
  let finalCreateStore;
  const reduxRouterMiddleware = routerMiddleware(history);
  const middleware = [
    reduxRouterMiddleware,
    clientMiddleware(client),
    thunkMiddleware,
  ];

  if (__CLIENT__) {
    if (__DEVELOPMENT__ && __DEVTOOLS__) {
      DevTools = require('../containers/DevTools/DevTools').default;
    }
    persistentStore = require('../../redux-pouchdb-plus/src/index').persistentStore;
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      persistentStore(),
      (() => (__DEVELOPMENT__ && __DEVTOOLS__) ? DevTools.instrument() : undefined)()
    )(_createStore);

  } else {
    finalCreateStore = compose(
      applyMiddleware(...middleware)
    )(_createStore);
  }

  const reducer = require('./modules/reducer').rootReducer;
  const store = finalCreateStore(reducer, preloadedState);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer').rootReducer);
    });
  }

  return store;
}

export { createStore };

