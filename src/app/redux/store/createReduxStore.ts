import { AnyAction, applyMiddleware, compose, createStore } from 'redux';
// import createSagaMiddleware from 'redux-saga';
import {
  connectRoutes,
  Options /* , NOT_FOUND */,
  redirect,
} from 'redux-first-router';
import thunkMiddleware from 'redux-thunk';

import { clientMiddleware } from '../middleware/clientMiddleware';
import { checkAuth, isLoaded, killUser, loadAuth } from '../modules/user';
import { RedirectAction } from '../routing/nav';
import { linkToLogin } from '../routing/navHelpers';
import { routesMap } from '../routing/routesMap';

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
          } as RedirectAction);
          dispatch(redirect(action));
        }
      }
    },
  } as Options;

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
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        name: 'ROVER',
      })) ||
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
