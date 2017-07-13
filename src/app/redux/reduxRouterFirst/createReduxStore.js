import thunkMiddleware from 'redux-thunk';
// import createSagaMiddleware from 'redux-saga';
import { connectRoutes, redirect /* NOT_FOUND */ } from 'redux-first-router';
import { createStore, applyMiddleware, compose } from 'redux';

// import createSagaMonitor from '../sagas/sagaMonitor';


// // configuration
// const config = {
//   level: 'log',
//   effectTrigger: true,
//   effectResolve: true,
//   actionDispatch: true,
// };

// createSagaMonitor(config);

// import { getRootSaga } from '../sagas';
import { routesMap } from './routesMap';
import { clientMiddleware } from '../middleware/clientMiddleware';
import { loadAuth, isLoaded, killUser } from '../modules/user';// eslint-disable-line

function createReduxStore({ history, client, preloadedState }) { // eslint-disable-line

  let composeFuncs;
  const createRootReducer = require('../modules/reducer').createRootReducer;
  const options = {
    initialDispatch: false,
    onBeforeChange: (dispatch, getState, action) => {
      const userRequiredRoutes = ['HOME', 'ROVER_VIEW'];
      const userRequired = userRequiredRoutes.indexOf(action.type) > -1;
      const checkAuth = () => {// eslint-disable-line
        const { user: { user } } = getState();
        if (!user) {
          // console.log('__REQUIRE_LOGIN__1', getState());
          const _action = redirect({ type: 'LOGIN' }); // eslint-disable-line
          return dispatch(_action);
        }
      };
      if (userRequired) {
        // console.log('__REQUIRE_LOGIN__2');
        if (!isLoaded(getState())) {
          // console.log('__REQUIRE_LOGIN__3');
          // dispatch(loadAuth()).then(() => checkAuth());
          console.log('__REQUIRE_LOGIN__4');
          // checkAuth();
          // .then(() => checkAuth());
        } else {
          // console.log('__REQUIRE_LOGIN__5');
          checkAuth();
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
  const { reducer, middleware, enhancer, thunk, initialDispatch } = connectRoutes(history, routesMap, options);
  const rootReducer = createRootReducer(reducer);
  const middlewares = [
    middleware,
    thunkMiddleware,
    // persistentStoreMw,
    clientMiddleware(client),
    // persistentStoreMiddleware,
    // sagaMiddleware,
  ];

  const moduleHot = (__DEVELOPMENT__ && module.hot);
  const addDevTools = (__DEVELOPMENT__ && __DEVTOOLS__);
  const DevTools = addDevTools ? require('../../containers/DevTools/DevTools').default : false;

  if (__CLIENT__) {
    const persistentStore = require('../../../redux-pouchdb-plus/src/index').persistentStore;

    composeFuncs = [
      persistentStore(),
      applyMiddleware(...[...middlewares]),
      enhancer,
      ...(addDevTools ? [DevTools.instrument()] : []),
    ];

  } else {
    composeFuncs = [
      applyMiddleware(...middlewares),
      enhancer,
    ];
  }


  const store = createStore(rootReducer, preloadedState, compose(...composeFuncs));

  // sagaMiddleware.run().done
  // let rootTask;
  // const rootTask = sagaMiddleware.run(getRootSaga(client));
  // store.runSaga = sagaMiddleware.run;
  initialDispatch();

  if (moduleHot) {
    module.hot.accept('../modules/reducer', () => {
      const _rootReducer = require('../modules/reducer').createRootReducer(reducer);
      store.replaceReducer(_rootReducer);
    });
  }

  return { store, thunk /* , rootTask */ };

}

export { createReduxStore };
