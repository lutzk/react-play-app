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

export function reinit(reducerName) {
  // const reducerNames = Object.keys(initializedReducers);
  uninitializeReducers()
  // if (!reducerName) { // reinit all reducers
  //   reducerNames.map(name =>
  //     initializedReducers[name] = false);

  // } else { // reinit a specific reducer
  //   if (reducerNames.indexOf(reducerName) === -1) {
  //     throw Error(`Invalid persistent reducer to reinit: ${reducerName}`);
  //   }

  //   initializedReducers[reducerName] = false;
  // }

  return { type: REINIT };
}

export const reset = () => {
  uninitializeReducers();
  return { type: RESET };
};

export const persistentStore = (storeOptions = {}) => createStore => (reducer, initialState) => {
  const store = createStore(reducer, initialState);

  store.dispatch({
    type: INIT,
    store,
    storeOptions,
  });

  return store;
};

export const persistentReducer = (reducer/* , reducerOptions = {} */) => {

  let store;
  let changes;
  let saveReducer;
  let initialState;
  let currentState;
  let storeOptions;

  initializedReducers[reducer.name] = false;

  const isUserPresent = (store) => { // eslint-disable-line
    const userState = store ? store.getState().user : false;
    return (userState && userState.user && userState.user.userId);
  };

  const initSync = (localDb, remoteDb) =>
    localDb
      .sync(remoteDb, {
        live: true,
        retry: true,
        // doc_ids: [reducer.name]
        // batch_size: 20,
        heartbeat: 10000,
      });
      // .on('active', () => console.log('__ACTIVE'))
      // .on('change', () => console.log('__CHANGE', inSync()));
      // .on('complete', () => console.log('__COMPLETE'))
      // .on('error', e => console.log('__ERROR', e));
      // bla

  function toPouch(x) {
    return _.cloneDeep(x);
  }
  function fromPouch(x) {
    return _.cloneDeep(x);
  }
  function isEqual(x, y) {
    return _.isEqual(x, y);
  }

  // an action to update the current reducer state (used when
  // the state was fetched from the localDb)
  function setReducer(doc) {
    const { _id, _rev, state } = doc;
    const _state = fromPouch(state);

    store.dispatch({
      type: SET_REDUCER,
      reducer: _id,
      state: _state,
      _rev,
    });
  }

  // get the current db connector and initialize the state of this
  // reducer by loading it from the db or by saving it
  // to the db (if it is not already persisted there)
  function reinitReducer(state) {
    if (changes) {
      changes.cancel();
    }
    // let dbs = reducerOptions.dbs || storeOptions.dbs;
    let localDb;
    let remoteDb = false;
    const dbs = storeOptions.db(reducer.name, store);

    if (!isUserPresent(store)) {
      console.log('no user return');
      return;
    }

    if (dbs.local) {
      localDb = dbs.local;
    }
    if (dbs.remote) {
      remoteDb = dbs.remote;
    }

    saveReducer = save(localDb, CLIENT_HASH);

    localDb
      .get(reducer.name)
      .then(doc =>
        setReducer(doc))
      .catch((err) => { // eslint-disable-line
        if (err.status === 404) {
          if (remoteDb) {
            remoteDb
              .get(reducer.name)
              .then(remoteDoc =>
                setReducer(remoteDoc))
              .catch((remoteErr) => {
                if (err.status === 404) {
                  return saveReducer(reducer.name, toPouch(state));
                }
                throw remoteErr;
              });
          } else {
            return saveReducer(reducer.name, toPouch(state));
          }
        } else {
          throw err;
        }
      }).then(() => {
        // from here on the reducer was loaded from localDb or saved to localDb
        initializedReducers[reducer.name] = true;

        let ready = true; // eslint-disable-line
        Object.keys(initializedReducers).map((reducerName) => { // eslint-disable-line
          let exit = false;
          if (!initializedReducers[reducerName] && !exit) {
            ready = false;
            exit = true;
          }
        });


        if (remoteDb) {
          initSync(localDb, remoteDb);
        }

        // listen to changes in the localDb (e.g. when a replication occurs)
        // and update the reducer state when it happens
        return changes = localDb
          .changes({
            include_docs: true,
            live: true,
            since: 'now',
            doc_ids: [reducer.name],
          })
          .on('change', (change) => {
            if (change.doc.localId !== CLIENT_HASH) {
              if (!change.doc.state) {
                saveReducer(change.doc._id, toPouch(currentState));
              } else if (!isEqual(fromPouch(change.doc.state), currentState)) {
                setReducer(change.doc);
              }
            }
          });
      });
  }

  // the proxy function that wraps the real reducer
  return (state, action) => { // eslint-disable-line

    let nextState;
    let isInitialized;
    /* eslint-disable */
    switch (action.type) {
      case INIT:
        store = action.store;
        storeOptions = action.storeOptions;

      case REINIT:
        if ((!action.reducerName || action.reducerName === reducer.name) && isUserPresent(store)) {

          // // original
          // reinitReducer(initialState);
          // return currentState = initialState;

          // changed
          nextState = reducer(state, action);
          reinitReducer(nextState);
          // return nextState;
          return currentState = nextState;
        }

      case RESET:
        if (syncHandler && synInit) {
          syncHandler.cancel();
          synInit = false;
        }

        nextState = reducer(state, action);
        currentState = nextState;
        return nextState;

      case SET_REDUCER:
        if ((action.reducer === reducer.name && action.state) && isUserPresent(store)) {
          currentState = reducer(action.state, action);
          return currentState;
        }

      default:
        nextState = reducer(state, action); 

        if (!isUserPresent(store)) {
          return nextState;
        }

        if (!initialState) {
          initialState = nextState;
        }

        isInitialized = initializedReducers[reducer.name];
        if (isInitialized && !isEqual(nextState, currentState)) {
          currentState = nextState;
          try {
            saveReducer(reducer.name, toPouch(currentState));
          } catch (e) {
            console.log('saveReducerError::', e);
          }

        } else {
          currentState = nextState;
        }

        return currentState;
    }
    /* eslint-enable */
  };
};
