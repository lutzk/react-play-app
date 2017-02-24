import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import createMiddleware from './middleware/clientMiddleware';

export default function createStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);
  const middleware = [createMiddleware(client), reduxRouterMiddleware, thunkMiddleware];
  let finalCreateStore;

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const DevTools = require('../containers/DevTools/DevTools').default;
    finalCreateStore = compose(
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
  const store = finalCreateStore(reducer, data);

  // reduxRouterMiddleware.listenForReplays(store);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer').default);
    });
  }

  return store;
}
