import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import { clientMiddleware } from './middleware/clientMiddleware';

function createStore({ history, client, preloadedState }) { // eslint-disable-line
  let db;
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
      DevTools = require('./clientRequireProxy').DevTools;
    }
    db = require('./clientRequireProxy').db;
    persistentStore = require('./clientRequireProxy').persistentStore;
  }

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      persistentStore({ db }),
      DevTools.instrument()
    )(_createStore);

  } else if (__CLIENT__) {
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      persistentStore({ db })
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

