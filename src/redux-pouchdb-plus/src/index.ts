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
  REDUCER_CHANGE,
  // SYNC_INITIAL,
  // SYNC_INITIAL_SUCCESS,
  // SYNC_INITIAL_FAIL,
  REDUCER_READY as PW_REDUCER_READY,
  REDUCER_REGISTER,
  REDUCER_REINIT,
  REDUCER_RESET,
  REDUCER_SET,
  REDUCERS_READY,
  STORE_INIT,
} from '../../app/workers/pouchWorkerMsgTypes';
import { currySendMsg, initWorkerSync } from '../../app/workers/utils';

// A client hash to filter out local database changes (as those
// may lead to several race conditions).
// see also http://stackoverflow.com/questions/28280276/changes-filter-only-changes-from-other-db-instances

const INIT = '@@redux-pouchdb-plus/INIT';
const RESET = '@@redux-pouchdb-plus/RESET';
const REINIT = '@@redux-pouchdb-plus/REINIT';
const REINIT_SUCCESS = '@@redux-pouchdb-plus/REINIT_SUCCESS';
const REINIT_FAIL = '@@redux-pouchdb-plus/REINIT_FAIL';
const REQUEST_REINIT = '@@redux-pouchdb-plus/REQUEST_REINIT';
const SET_REDUCER = '@@redux-pouchdb-plus/SET_REDUCER';
const REDUCER_READY = '@@redux-pouchdb-plus/REDUCER_READY';

const SYNC = '@@redux-pouchdb-plus/START_SYNC';
const SYNC_SUCCESS = '@@redux-pouchdb-plus/SYNC_SUCCESS';
const SYNC_FAIL = '@@redux-pouchdb-plus/SYNC_FAIL';

let pouchWorker;
let sendMsgToWorker;
const initializedReducers = {};

const setReducerInitialized = reducerName =>
  (initializedReducers[reducerName] = true);

const setReducerUninitialized = reducerName =>
  (initializedReducers[reducerName] = false);

const setReducersUninitialized = () =>
  Object.keys(initializedReducers).map(
    name => (initializedReducers[name] = false),
  );

const reinit = () => dispatch => {
  setReducersUninitialized();
  return dispatch({
    type: REINIT,
  });
};

const reset = () => dispatch => {
  setReducersUninitialized();
  return dispatch({ type: RESET });
};

const requestReinit = () => dispatch => dispatch({ type: REQUEST_REINIT });
const persistentStore = () => createStore => (reducer, initialState) => {
  const store = createStore(reducer, initialState);
  const state = store.getState();
  pouchWorker = initWorkerSync('/worker.pouch.js', 'pouchWorker');
  if (pouchWorker) {
    sendMsgToWorker = currySendMsg(pouchWorker);
    sendMsgToWorker({ ...STORE_INIT }).then(reply =>
      console.log('reply from pouch worker: ', reply),
    );
  }
  console.log('INI S', state);
  store.dispatch({
    store,
    state,
    type: INIT,
    pouchWorker,
    sendMsgToWorker,
  });

  return store;
};

const isUserPresent = user => user && user.user && user.user.userId;

const persistentReducer = (reducer, name /* , reducerOptions = {} */) => {
  let store;
  let initialState;
  let currentState;

  const workerMsgHandler = e => {
    const {
      data: { type, doc, reducerName },
    } = e;
    if (type) {
      switch (type) {
        case PW_REDUCER_READY.type:
          setReducerInitialized(reducerName);
          setReducerReady(reducerName);
          break;

        case REDUCER_SET.type:
          setReducer(doc);
          break;

        case REDUCERS_READY.type:
          setReady();
          break;

        case 'CLOSE':
          // console.log('_RECIEVED_CLOSE_');
          break;

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
      type: SET_REDUCER,
    });
  };

  const setReady = () => store.dispatch({ type: REINIT_SUCCESS });
  const setReducerReady = reducerName =>
    store.dispatch({
      reducerName,
      type: REDUCER_READY,
    });

  const reinitReducerInWorker = (reducerName, state, currentState, user) => {
    if (pouchWorker) {
      const msg = { reducerName, ...REDUCER_REINIT, state, currentState, user };
      sendMsgToWorker(msg);
    }
  };

  const sendChangeToWorker = async (reducerName, nextState) => {
    try {
      const msg = { reducerName, nextState, ...REDUCER_CHANGE };
      await sendMsgToWorker(msg);
    } catch (e) {
      console.log('saveReducerError::', e);
    }
  };

  const debouncedSignalChangeToWorker = debounce(sendChangeToWorker, 5000);
  const reducerName = name;
  setReducerUninitialized(reducerName);

  // the proxy function that wraps the real reducer
  return (state, action) => {
    let nextState;
    let isInitialized;
    const user = action.user || null;
    switch (action.type) {
      case INIT:
        store = action.store;
        pouchWorker = action.pouchWorker;
        pouchWorker.onmessage = e => workerMsgHandler(e);

        sendMsgToWorker = action.sendMsgToWorker;
      case REINIT:
        if (isUserPresent(user)) {
          nextState = reducer(state, action);
          // sendMsgToWorker({ ...REDUCER_REGISTER, reducerName });
          reinitReducerInWorker(reducerName, nextState, currentState, user);
          return (currentState = nextState);
        }

        return state;

      case RESET:
        sendMsgToWorker({ ...REDUCER_RESET });
        nextState = reducer(state, action);
        return (currentState = nextState);

      case SET_REDUCER:
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
        if (!user) {
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
  REQUEST_REINIT,
  REINIT,
  REINIT_SUCCESS,
  REINIT_FAIL,
  reset,
  reinit,
  requestReinit,
  persistentStore,
  persistentReducer,
  SYNC,
  SYNC_SUCCESS,
  SYNC_FAIL,
  REDUCER_READY,
  // setPersistetStore,
};
