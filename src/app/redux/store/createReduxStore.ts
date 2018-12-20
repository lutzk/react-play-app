import {
  applyMiddleware,
  compose,
  createStore,
  DeepPartial,
  Dispatch,
  Store,
} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
// import createSagaMiddleware from 'redux-saga';
import {
  connectRoutes,
  Options /* , NOT_FOUND */,
  redirect,
} from 'redux-first-router';
// import thunkMiddleware, { ThunkMiddleware } from 'redux-thunk';
import { ApiClient } from '../../../helpers/ApiClient';
import { persistentStore } from '../../../redux-pouchdb-plus/src/index';
import { clientMiddleware } from '../middleware/clientMiddleware';
import { ApplicationState, createRootReducer } from '../modules/reducer';
import {
  APP_ACTIONS,
  MyThunkDispatch,
  PromiseDispatch,
} from '../modules/types';
import { checkAuth, isLoaded, killUser, loadAuth } from '../modules/user';
import { RedirectAction } from '../routing/nav';
import { linkToLogin } from '../routing/navHelpers';
import { routesMap } from '../routing/routesMap';
import { promise, thunk as rthunk } from './storeTypes';

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
interface Params {
  client: ApiClient;
  preloadedState?: DeepPartial<ApplicationState>;
  persistentStore?: ReturnType<typeof persistentStore>;
  reqPath?: any;
}
function createReduxStore({
  client,
  preloadedState,
  persistentStore,
  reqPath,
}: Params) {
  const options: Options<{}, ApplicationState> = {
    initialEntries: reqPath,
    initialDispatch: false,
    onBeforeChange: (dispatch: Dispatch, getState, bag) => {
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
  } = connectRoutes<{}, ApplicationState>(routesMap, options);

  const rootReducer = createRootReducer(reducer);
  const middlewares = applyMiddleware(
    middleware,
    rthunk<ApplicationState, MyThunkDispatch>(),
    clientMiddleware(client),
  );

  const addDevTools = __CLIENT__ && __DEVELOPMENT__ && __DEVTOOLS__;
  let enhancers;
  let composeEnhancers: typeof compose;
  if (addDevTools) {
    composeEnhancers = composeWithDevTools({
      name: 'ROVER',
    });
    enhancers = composeEnhancers(persistentStore, middlewares, enhancer);
  } else {
    composeEnhancers = compose;
    enhancers = composeEnhancers(middlewares, enhancer);
  }

  let store: Store<ApplicationState, APP_ACTIONS>;
  store = createStore(rootReducer, preloadedState, enhancers);

  // sagaMiddleware.run().done
  // let rootTask;
  // const rootTask = sagaMiddleware.run(getRootSaga(client));
  // store.runSaga = sagaMiddleware.run;
  initialDispatch();

  return { store, thunk /* , rootTask */ };
}

export { createReduxStore };
