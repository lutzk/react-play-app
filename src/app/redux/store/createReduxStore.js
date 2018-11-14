import thunkMiddleware from 'redux-thunk';
// import createSagaMiddleware from 'redux-saga';
import { connectRoutes, redirect /* , NOT_FOUND */ } from 'redux-first-router';
import { createStore, applyMiddleware, compose } from 'redux';

// import { LOGIN } from './nav';
import { routesMap } from '../routing/routesMap';
import { linkToLogin } from '../routing/navTypes';
import { clientMiddleware } from '../middleware/clientMiddleware';
import { loadAuth, checkAuth, isLoaded, killUser } from '../modules/user';

// import { getRootSaga } from '../sagas';
// import createSagaMonitor from '../sagas/sagaMonitor';
// // configuration
// const config = {
//   level: 'log',
//   effectTrigger: true,
//   effectResolve: true,
//   actionDispatch: true,
// };
// createSagaMonitor(config);

function createReduxStore({ client, preloadedState, reqPath = null }) {
  let composeFuncs;
  const createRootReducer = require('../modules/reducer').createRootReducer;
  const options = {
    initialEntries: reqPath,
    initialDispatch: false,
    onBeforeChange: (dispatch, getState, bag) => {
      const userRequiredRoutes = ['ROVER_VIEW'];
      const userRequired = userRequiredRoutes.indexOf(bag.action.type) > -1;
      if (userRequired) {
        // not async https://github.com/faceyspacey/redux-first-router/issues/90
        // return checkAuth(dispatch, getState);
        const {
          user: { user },
        } = getState();
        if (!user) {
          const action = redirect({
            ...linkToLogin,
            nextPathname: getState().location.pathname,
          });
          dispatch(redirect(action));
        }
      }
    },
  };

  // const sagaMiddleware = createSagaMiddleware({
  //   sagaMonitor: createSagaMonitor({
  //     level: 'warn',
  //     effectTrigger: true,
  //   }),
  // });
  // applyMiddleware(sagaMiddleware)
  const {
    reducer,
    middleware,
    enhancer,
    thunk,
    initialDispatch,
  } = connectRoutes(routesMap, options);
  const rootReducer = createRootReducer(reducer);
  const middlewares = [middleware, thunkMiddleware, clientMiddleware(client)];

  const moduleHot = __DEVELOPMENT__ && module.hot;
  const addDevTools = __DEVELOPMENT__ && __DEVTOOLS__;
  const DevTools = addDevTools
    ? require('../../containers/DevTools/DevTools').default
    : false;

  if (__CLIENT__) {
    const persistentStore = require('../../../redux-pouchdb-plus/src/index')
      .persistentStore;

    composeFuncs = [
      persistentStore(),
      applyMiddleware(...[...middlewares]),
      enhancer,
    ];
  } else {
    composeFuncs = [applyMiddleware(...middlewares), enhancer];
  }

  const composeEnhancers =
    (__CLIENT__ &&
      addDevTools &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  const store = createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(...composeFuncs),
  );

  // sagaMiddleware.run().done
  // let rootTask;
  // const rootTask = sagaMiddleware.run(getRootSaga(client));
  // store.runSaga = sagaMiddleware.run;
  initialDispatch();

  if (moduleHot) {
    module.hot.accept('../modules/reducer', () => {
      const newRootReducer = require('../modules/reducer').createRootReducer(
        reducer,
      );
      store.replaceReducer(newRootReducer);
    });
  }

  return { store, thunk /* , rootTask */ };
}

export { createReduxStore };
