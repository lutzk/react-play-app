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
import save from './save.js';

// export { inSync } from './save.js';

// A client hash to filter out local database changes (as those
// may lead to several race conditions).
// see also http://stackoverflow.com/questions/28280276/changes-filter-only-changes-from-other-db-instances
const CLIENT_HASH = uuid.v1();

const INIT = '@@redux-pouchdb-plus/INIT';
const REINIT = '@@redux-pouchdb-plus/REINIT';
const RESET = '@@redux-pouchdb-plus/RESET';
const SET_REDUCER = '@@redux-pouchdb-plus/SET_REDUCER';

const initializedReducers = {};

const uninitializeReducers = () =>
  Object.keys(initializedReducers).map(name =>
    initializedReducers[name] = false);

const reinit = () => {
  uninitializeReducers();
  return { type: REINIT };
};

const reset = () => {
  uninitializeReducers();
  return { type: RESET };
};

const persistentStore = (storeOptions = {}) => createStore => (reducer, initialState) => {
  const store = createStore(reducer, initialState);
  const state = store.getState();
  store.dispatch({
    type: INIT,
    store,
    state,
    storeOptions,
  });

  return store;
};

const isUserPresent = (store) => { // eslint-disable-line
  const userState = store ? store.getState().user : false;
  return (userState && userState.user && userState.user.userId);
};

const initSync = (localDb, remoteDb, reducerNames) =>
  localDb
    .sync(remoteDb, {
      live: true,
      retry: true,
      doc_ids: reducerNames,
      // batch_size: 20,
      heartbeat: 10000,
    });
    // .on('active', () => console.log('__ACTIVE'))
    // .on('change', () => console.log('__CHANGE', inSync()));
    // .on('complete', () => console.log('__COMPLETE'))
    // .on('error', e => console.log('__ERROR', e));
    // bla

const persistentReducer = (reducer/* , reducerOptions = {} */) => {

  let store;
  let changes;
  let saveReducer;
  let initialState;
  let currentState;
  let storeOptions;
  let syncHandler;
  let syncInit;

  const reducerName = reducer.name;

  initializedReducers[reducer.name] = false;

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

  const initFromDB = (db, reducerName) =>// eslint-disable-line
    db
      .get(reducerName)
      .then(doc =>
        setReducer(doc))
      .catch(err => err);

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

    const dbs = storeOptions.db(reducerName, store);
    const prefetched = state.prefetched || false;
    const localDb = dbs.local || false;
    const remoteDb = dbs.remote || false;

    if (changes) {
      changes.cancel();
    }

    saveReducer = save(localDb, CLIENT_HASH);

    if (prefetched) {
      saveReducer(reducerName, _.cloneDeep(state));
    } else {
      await initDBState(state, localDb, remoteDb, reducerName, saveReducer);
    }

    // from here on the reducer was loaded from localDb or saved to localDb
    initializedReducers[reducer.name] = true;
    const initializedReducerKeys = Object.keys(initializedReducers);

    const ready = checkReady(initializedReducerKeys, initializedReducers);

    if (ready && remoteDb && !syncInit) {
      syncHandler = initSync(localDb, remoteDb, initializedReducerKeys);
      syncInit = true;
    }

    changes = initChanges(localDb, reducerName, saveReducer, currentState);
  }

  // the proxy function that wraps the real reducer
  return (state, action) => { // eslint-disable-line

    let nextState;
    let isInitialized;

    switch (action.type) {
      case INIT:
        store = action.store;
        storeOptions = action.storeOptions;

      case REINIT:// eslint-disable-line
        if (isUserPresent(store)) {
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
  INIT,
  RESET,
  REINIT,
  SET_REDUCER,
  reset,
  reinit,
  persistentStore,
  persistentReducer,
};
