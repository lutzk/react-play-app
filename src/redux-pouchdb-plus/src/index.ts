/*
  patched
    to:
      - just sync to db if a user is logged in
      - storeOptions.db is a function wich returns an object with keys for local and remote db connector of the user
      - load from remote couch if no local pouch was found
      - remove immutable js dependency
      - removed hooks (for now)
    by:
      lutzk
*/

import deepEqual from 'deep-equal';
import { debounce } from 'lodash';
import {
  Action,
  AnyAction,
  createStore,
  DeepPartial,
  Reducer,
  Store,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
} from 'redux';
import { ApplicationState } from '../../app/redux/modules/reducer';
import {
  APP_ACTIONS,
  PromiseAction,
  Thunk,
} from '../../app/redux/modules/types';
import { UserState } from '../../app/redux/modules/user';
import { POUCH_WORKER_TYPES } from '../../workers/pouchWorkerTypes';
import {
  currySendMsg,
  initWorkerSync,
  PouchWorkerAction,
  workersEnabled,
} from '../../workers/utils';

// A client hash to filter out local database changes (as those
// may lead to several race conditions).
// see also http://stackoverflow.com/questions/28280276/changes-filter-only-changes-from-other-db-instances

enum POUCH_ACTION_TYPES {
  INIT = '@@redux-pouchdb-plus/INIT',
  RESET = '@@redux-pouchdb-plus/RESET',
  REINIT = '@@redux-pouchdb-plus/REINIT',
  REINIT_REDUCERS = '@@redux-pouchdb-plus/REINIT_REDUCERS',
  REINIT_SUCCESS = '@@redux-pouchdb-plus/REINIT_SUCCESS',
  REINIT_FAIL = '@@redux-pouchdb-plus/REINIT_FAIL',
  REQUEST_REINIT = '@@redux-pouchdb-plus/REQUEST_REINIT',
  SET_REDUCER = '@@redux-pouchdb-plus/SET_REDUCER',
  REDUCER_READY = '@@redux-pouchdb-plus/REDUCER_READY',
  SYNC = '@@redux-pouchdb-plus/START_SYNC',
  SYNC_SUCCESS = '@@redux-pouchdb-plus/SYNC_SUCCESS',
  SYNC_FAIL = '@@redux-pouchdb-plus/SYNC_FAIL',
  SYNC_INITIAL = '@@redux-pouchdb-plus/SYNC_INITIAL',
  SYNC_INITIAL_SUCCESS = '@@redux-pouchdb-plus/SYNC_INITIAL_SUCCESS',
  SYNC_INITIAL_FAIL = '@@redux-pouchdb-plus/SYNC_INITIAL_FAIL',
}

type WRAPPED_REDUCER_ACTIONS =
  | POUCH_ACTION_TYPES.INIT
  | POUCH_ACTION_TYPES.REINIT
  | POUCH_ACTION_TYPES.RESET
  | POUCH_ACTION_TYPES.SET_REDUCER;

type SendMsgToWorker = ReturnType<typeof currySendMsg>;
type PartialAppState = DeepPartial<ApplicationState>;
type MyStore = Store<PartialAppState, APP_ACTIONS>;

interface WrapedReducerAction<TReducerState> {
  user: UserState;
  store: MyStore;
  pouchWorker: Worker;
  sendMsgToWorker: SendMsgToWorker;
  reducer: string;
  state: TReducerState;
  type: WRAPPED_REDUCER_ACTIONS;
}

interface PouchAction extends PromiseAction {
  type: POUCH_ACTION_TYPES;
  asyncTypes?: any[];
}

interface InitializedReducers {
  [reducer: string]: boolean;
}

let pouchWorker: Worker;
let sendMsgToWorker: SendMsgToWorker;
const initializedReducers: InitializedReducers = {};

const setReducerInitialized = (reducerName: string) =>
  (initializedReducers[reducerName] = true);

const setReducerUninitialized = (reducerName: string) =>
  (initializedReducers[reducerName] = false);

const setReducersUninitialized = () =>
  Object.keys(initializedReducers).forEach(
    name => (initializedReducers[name] = false),
  );

// const reinit = () => dispatch => {
//   setReducersUninitialized();
//   return dispatch({
//     type: POUCH_ACTION_TYPES.REINIT,
//   });
// };

const reset: Thunk<PouchAction> = () => dispatch => {
  setReducersUninitialized();
  return dispatch({ type: POUCH_ACTION_TYPES.RESET });
};

// const requestReinit = () => dispatch =>
//   dispatch({ type: POUCH_ACTION_TYPES.REQUEST_REINIT });

// function stateExtension() {
//   interface State {
//     someField: 'string';
//   }
//   const reducer: Reducer<State> = null as any;
//   interface ExtraState {
//     extraField: 'extra';
//   }

//   const enhancer: StoreEnhancer<{}, ExtraState> = createStore => <
//     S,
//     A extends Action = AnyAction
//   >(
//     reducer: Reducer<S, A>,
//     preloadedState?: DeepPartial<S>,
//   ) => {
//     const wrappedReducer: Reducer<S & ExtraState, A> = null as any;
//     const wrappedPreloadedState: S & ExtraState = null as any;
//     return createStore(wrappedReducer, wrappedPreloadedState);
//   };

//   const store = createStore(reducer, enhancer);

//   // tslint:disable-next-line:no-unused-expression
//   store.getState().someField;
//   // tslint:disable-next-line:no-unused-expression
//   store.getState().extraField;
//   // typings:expect-error
//   // store.getState().wrongField;
// }

const persistentStore = (): StoreEnhancer => createStore => (
  reducer,
  preloadedState,
) => {
  const store = createStore(reducer, preloadedState);
  const _store = (store as any) as Store<ApplicationState, APP_ACTIONS>;
  const state = _store.getState();
  if (workersEnabled()) {
    pouchWorker = initWorkerSync('/worker.pouch.js', 'pouchWorker');
    sendMsgToWorker = currySendMsg(pouchWorker);
    sendMsgToWorker({ type: POUCH_WORKER_TYPES.STORE_INIT }).then(reply =>
      console.log('reply from pouch worker: ', reply),
    );
  }

  _store.dispatch({
    store: _store,
    state,
    type: POUCH_ACTION_TYPES.INIT,
    pouchWorker,
    sendMsgToWorker,
  });

  return store;
};

const isUserPresent = (user: UserState) =>
  !!(user && user.user && user.user.userId);

const persistentReducer = <TReducerState>(
  reducer: Reducer<TReducerState, APP_ACTIONS>,
  name: string,
) => {
  let store: Store<PartialAppState, APP_ACTIONS>;
  let initialState: TReducerState;
  let currentState: TReducerState;

  const workerMsgHandler = (e: MessageEvent) => {
    const {
      data: { type, doc, reducerName },
    }: { data: PouchWorkerAction } = e;
    if (type) {
      switch (type) {
        case POUCH_WORKER_TYPES.REDUCER_READY:
          setReducerInitialized(reducerName);
          setReducerReady(reducerName);
          break;

        case POUCH_WORKER_TYPES.REDUCER_SET:
          setReducer(doc);
          break;

        case POUCH_WORKER_TYPES.REDUCERS_READY:
          setReady();
          break;

        // case 'CLOSE':
        //   // console.log('_RECIEVED_CLOSE_');
        //   break;

        default:
          break;
      }
    }
  };

  const setReducer = doc => {
    const { _rev, _id: reducer, state: dbState } = doc;
    const state = dbState;

    store.dispatch({
      _rev,
      state,
      reducer,
      type: POUCH_ACTION_TYPES.SET_REDUCER,
    });
  };

  const setReady = () =>
    store.dispatch({ type: POUCH_ACTION_TYPES.REINIT_SUCCESS });

  const setReducerReady = reducerName =>
    store.dispatch({
      reducerName,
      type: POUCH_ACTION_TYPES.REDUCER_READY,
    });

  const reinitReducerInWorker = (
    reducerName: string,
    state: TReducerState,
    currentState: TReducerState,
    user: UserState,
  ) => {
    if (pouchWorker) {
      const msg = {
        reducerName,
        type: POUCH_WORKER_TYPES.REDUCER_REINIT,
        state,
        currentState,
        user,
      };
      sendMsgToWorker(msg);
    }
  };

  const sendChangeToWorker = async (
    reducerName: string,
    nextState: PartialAppState,
  ) => {
    try {
      const msg = {
        reducerName,
        nextState,
        type: POUCH_WORKER_TYPES.REDUCER_CHANGE,
      };
      await sendMsgToWorker(msg);
    } catch (e) {
      console.error('saveReducerError::', e);
    }
  };

  const debouncedSignalChangeToWorker = debounce(sendChangeToWorker, 5000);
  const reducerName = name;
  setReducerUninitialized(reducerName);

  // the proxy function that wraps the real reducer
  return (
    state: TReducerState,
    action: WrapedReducerAction<TReducerState>,
  ): TReducerState => {
    let nextState: TReducerState;
    let isInitialized: boolean;
    const user = action.user || null;

    switch (action.type) {
      case POUCH_ACTION_TYPES.INIT:
        store = action.store;
        pouchWorker = action.pouchWorker;
        pouchWorker.onmessage = e => workerMsgHandler(e);
        sendMsgToWorker = action.sendMsgToWorker;

      // case POUCH_ACTION_TYPES.SYNC_INITIAL:
      //   if (isUserPresent(user)) {
      //     nextState = reducer(state, action);
      //     // sendMsgToWorker({ ...REDUCER_REGISTER, reducerName });
      //     reinitReducerInWorker(reducerName, nextState, currentState, user);
      //     return (currentState = nextState);
      //   }

      //   return state;

      case POUCH_ACTION_TYPES.REINIT:
        if (isUserPresent(user)) {
          nextState = reducer(state, action);
          // sendMsgToWorker({ ...REDUCER_REGISTER, reducerName });
          reinitReducerInWorker(reducerName, nextState, currentState, user);
          return (currentState = nextState);
        }

        return state;

      case POUCH_ACTION_TYPES.RESET:
        sendMsgToWorker({ type: POUCH_WORKER_TYPES.REDUCER_RESET });
        nextState = reducer(state, action);
        return (currentState = nextState);

      case POUCH_ACTION_TYPES.SET_REDUCER:
        if (
          action.reducer === reducerName &&
          action.state &&
          isUserPresent(user)
        ) {
          currentState = reducer(action.state, action);
          return currentState;
        }

      default:
        nextState = reducer(state, action);
        if (!isUserPresent(user)) {
          return nextState;
        }
        if (!initialState) {
          initialState = nextState;
        }

        isInitialized = initializedReducers[reducerName];
        if (isInitialized && !deepEqual(nextState, currentState)) {
          currentState = nextState;
          debouncedSignalChangeToWorker(reducerName, nextState);
        } else {
          currentState = nextState;
        }
        return currentState;
    }
  };
};

export {
  reset,
  PouchAction,
  persistentStore,
  persistentReducer,
  POUCH_ACTION_TYPES,
  SendMsgToWorker,
};
