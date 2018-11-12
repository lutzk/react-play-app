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

import { debounce } from 'lodash';
import { cloneDeep, isEqual } from 'lodash'; // eslint-disable-line
import { initWorkerSync, currySendMsg } from '../../app/workers/utils';
import {
  STORE_INIT,
  // SYNC_INITIAL,
  // SYNC_INITIAL_SUCCESS,
  // SYNC_INITIAL_FAIL,
  REDUCER_SET,
  REDUCER_RESET,
  REDUCER_REINIT,
  REDUCER_CHANGE,
  REDUCER_REGISTER,
  REDUCER_READY as PW_REDUCER_READY,
  REDUCERS_READY,
} from '../../app/workers/pouchWorkerMsgTypes';

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
    } = e; // eslint-disable-line
    if (type) {
      switch (type) {
        case PW_REDUCER_READY.type:
          setReducerInitialized(reducerName);
          setReducerReady(reducerName); // eslint-disable-line no-use-before-define
          break;

        case REDUCER_SET.type:
          setReducer(doc); // eslint-disable-line no-use-before-define
          break;

        case REDUCERS_READY.type:
          setReady(); // eslint-disable-line no-use-before-define
          // store.dispatch({ type: REINIT_SUCCESS });
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
    const { _rev, _id: reducer, state: dbState } = doc; // eslint-disable-line
    const state = cloneDeep(dbState);
    // const state = dbState;

    store.dispatch({
      _rev,
      state,
      reducer,
      type: SET_REDUCER,
    });
  };

  const setReady = () => store.dispatch({ type: REINIT_SUCCESS });
  const setReducerReady = (reducerName, initFrom) =>
    store.dispatch({
      // eslint-disable-line
      reducerName,
      type: REDUCER_READY,
    });

  const reinitReducerInWorker = (reducerName, state, currentState, user) => {
    // eslint-disable-line
    if (pouchWorker) {
      const msg = { reducerName, ...REDUCER_REINIT, state, currentState, user };
      sendMsgToWorker(msg);
    }
  };

  const sendChangeToWorker = async (reducerName, nextState) => {
    // eslint-disable-line
    try {
      const msg = { reducerName, nextState, ...REDUCER_CHANGE };
      await sendMsgToWorker(msg);
    } catch (e) {
      console.log('saveReducerError::', e);
    }
  };

  const debouncedSignalChangeToWorker = debounce(sendChangeToWorker, 250, {
    leading: true,
  });
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
          sendMsgToWorker({ ...REDUCER_REGISTER, reducerName });
          nextState = reducer(state, action);
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
        if (isInitialized && !isEqual(nextState, currentState)) {
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
