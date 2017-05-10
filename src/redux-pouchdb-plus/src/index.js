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

import uuid from 'uuid';
import _ from 'lodash'; // eslint-disable-line
import { save } from './save.js';

// export { inSync } from './save.js';

// A client hash to filter out local database changes (as those
// may lead to several race conditions).
// see also http://stackoverflow.com/questions/28280276/changes-filter-only-changes-from-other-db-instances
const CLIENT_HASH = uuid.v1();

const INIT = '@@redux-pouchdb-plus/INIT';
const RESET = '@@redux-pouchdb-plus/RESET';
const REINIT = '@@redux-pouchdb-plus/REINIT';
const REINIT_SUCCESS = '@@redux-pouchdb-plus/REINIT_SUCCESS';
const REINIT_FAIL = '@@redux-pouchdb-plus/REINIT_FAIL';
const REQUEST_REINIT = '@@redux-pouchdb-plus/REQUEST_REINIT';
const SET_REDUCER = '@@redux-pouchdb-plus/SET_REDUCER';
const REDUCER_READY = '@@redux-pouchdb-plus/REDUCER_READY';

const initializedReducers = {};

const uninitializeReducers = () =>
  Object.keys(initializedReducers).map(name =>
    initializedReducers[name] = false);

const reinit = () => (dispatch) => {
  uninitializeReducers();
  return dispatch({
    type: REINIT,
  });
};

const reset = () => (dispatch) => {
  uninitializeReducers();
  return dispatch({ type: RESET });
};

const requestReinit = () => dispatch => dispatch({ type: REQUEST_REINIT });

const persistentStore = () => createStore => (reducer, initialState) => {
  const store = createStore(reducer, initialState);
  const state = store.getState();

  store.dispatch({
    type: INIT,
    store,
    state,
  });

  return store;
};

const isUserPresent = (store) => { // eslint-disable-line
  const userState = store ? store.getState().user : false;
  return (userState && userState.user && userState.user.userId);
};

const initSync = (localDb, remoteDb, reducerNames) =>
  localDb
    .replicate.to(remoteDb, {
      live: true,
      retry: true,
      doc_ids: reducerNames,
      // batch_size: 20,
      // heartbeat: 10000,
    });
    // .on('active', () => console.log('__ACTIVE'))
    // .on('change', () => console.log('__CHANGE', inSync()));
    // .on('complete', () => console.log('__COMPLETE'))
    // .on('error', e => console.log('__ERROR', e));
    // bla

let DBS;
let syncInit;
let syncHandler;
let dbsDestroyd;

const persistentReducer = (reducer/* , reducerOptions = {} */) => {

  let store;
  let changes;
  let saveReducer;
  let initialState;
  let currentState;
  // let syncHandler;
  // let syncInit;

  const reducerName = reducer.name;

  initializedReducers[reducerName] = false;

  const setReducer = (doc) => {
    const { _rev, _id: reducer, state: dbState } = doc;// eslint-disable-line
    const state = _.cloneDeep(dbState);

    store.dispatch({
      _rev,
      state,
      reducer,
      type: SET_REDUCER,
    });
  };

  const setReady = () => store.dispatch({ type: REINIT_SUCCESS });

  const setReducerReady = (reducerName, initFrom) => store.dispatch({// eslint-disable-line
    reducerName,
    type: REDUCER_READY,
  });

  const initFromDB = (db, reducerName) =>// eslint-disable-line
    db
      .get(reducerName)
      .then(doc => setReducer(doc))
      .catch((err) => {
        console.log('initFromDB', err);
        return err;
      });

  const initDBState = async (state, localDb, remoteDb, reducerName, _saveReducer) => {// eslint-disable-line
    let remoteInitError;
    const localInitError = await initFromDB(localDb, reducerName);

    if (localInitError && localInitError.status === 404) {
      if (remoteDb) {
        remoteInitError = await initFromDB(remoteDb, reducerName);
        if (remoteInitError && remoteInitError.status === 404) {
          return _saveReducer(reducerName, _.cloneDeep(state));
        }
        return;// eslint-disable-line
      }

      return _saveReducer(reducerName, _.cloneDeep(state));
    }
    if (localInitError || remoteInitError) {
      throw Error(localInitError || remoteInitError);
    }
  };

  const initChanges = (db, reducerName, _saveReducer, _currentState) =>// eslint-disable-line
    db
      .changes({
        live: true,
        since: 'now',
        doc_ids: [reducerName],
        include_docs: true,
      })
      .on('change', (change) => {
        if (change.doc.localId !== CLIENT_HASH) {
          if (!change.doc.state) {
            _saveReducer(change.doc._id, _.cloneDeep(_currentState));
          } else if (!_.isEqual(_.cloneDeep(change.doc.state), _currentState)) {
            setReducer(change.doc);
          }
        }
      });

  const checkReady = (keys, reducers) => {
    let ready = true;
    keys.map((reducerName) => { // eslint-disable-line
      let exit = false;
      if (!reducers[reducerName] && !exit) {
        ready = false;
        exit = true;
      }
    });
    return ready;
  };

  async function reinitReducer(state) {

    const dbs = DBS;
    const localDb = dbs.local || false;
    const remoteDb = dbs.remote || false;
    const prefetched = state.prefetched || false;

    if (changes) {
      changes.cancel();
    }

    saveReducer = save(localDb, CLIENT_HASH);

    if (prefetched) {
      await saveReducer(reducerName, _.cloneDeep(state));
    } else {
      await initDBState(state, localDb, remoteDb, reducerName, saveReducer);
    }

    initializedReducers[reducerName] = true;
    const initializedReducerKeys = Object.keys(initializedReducers);
    const ready = checkReady(initializedReducerKeys, initializedReducers);

    if (ready && remoteDb && !syncInit) {
      syncHandler = initSync(localDb, remoteDb, initializedReducerKeys);
      syncInit = true;
      setReady();
    }

    changes = initChanges(localDb, reducerName, saveReducer, currentState);
    setReducerReady(reducerName);
  }

  // the proxy function that wraps the real reducer
  return (state, action) => { // eslint-disable-line

    let nextState;
    let isInitialized;

    switch (action.type) {

      case INIT:
        store = action.store;

      case REINIT: // eslint-disable-line
        if (isUserPresent(store)) {
          if (!DBS) {
            const dbs = require('../../app/redux/clientRequireProxy').db;
            DBS = dbs(store.getState());
          }
          nextState = reducer(state, action);
          reinitReducer(nextState);
          return currentState = nextState;
        }

        return state;

      case RESET:
        if (syncHandler && syncInit) {
          syncHandler.cancel();
          syncInit = false;
        }

        if (DBS && DBS.local && !dbsDestroyd) {
          DBS.local.destroy()
            .then((result) => {
              dbsDestroyd = true;
              return result;
            })
            .catch((e) => {
              console.log('DB DESTROY ERROR', e);
              return e;
            });
        }

        nextState = reducer(state, action);
        return currentState = nextState;

      case SET_REDUCER:
        if ((action.reducer === reducerName && action.state) && isUserPresent(store)) {
          currentState = reducer(action.state, action);
          return currentState;
        }

      default:// eslint-disable-line
        nextState = reducer(state, action);

        if (!isUserPresent(store)) {
          return nextState;
        }

        if (!initialState) {
          initialState = nextState;
        }

        isInitialized = initializedReducers[reducerName];
        if (isInitialized && !_.isEqual(nextState, currentState)) {
          currentState = nextState;
          try {
            saveReducer(reducerName, _.cloneDeep(currentState));
          } catch (e) {
            console.log('saveReducerError::', e);
          }

        } else {
          currentState = nextState;
        }

        return currentState;
    }
  };
};

export {
  reset,
  reinit,
  requestReinit,
  persistentStore,
  persistentReducer,
};
