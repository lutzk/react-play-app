import uuid from 'uuid';
import { cloneDeep, isEqual, debounce } from 'lodash'; // eslint-disable-line

import { save } from '../../redux-pouchdb-plus/src/save';
import { currySendMsg } from '../../app/workers/utils';
import { getDBS } from '../../helpers/getUserDBS';

import {
  STORE_INIT,
  SYNC_INITIAL,
  SYNC_INITIAL_SUCCESS,
  SYNC_INITIAL_FAIL,
  REDUCER_SET,
  REDUCER_RESET,
  REDUCER_REINIT,
  REDUCER_CHANGE,
  REDUCER_READY,
  REDUCERS_READY,
  REDUCER_REGISTER,
} from './pouchWorkerMsgTypes';

let DBS;
let changes;
let syncInit;
let syncHandler;
let saveReducer;

const CLIENT_HASH = uuid.v1();
const initializedReducers = {};
const sendMsgToClient = currySendMsg(self);

let settingDBS = false;
const setDBS = async user => {
  if (!settingDBS) {
    settingDBS = true;
    DBS = await getDBS(user);
    settingDBS = false;
  }
};

const setReducerInitialized = reducerName =>
  (initializedReducers[reducerName] = true);

const setReducerUninitialized = reducerName =>
  (initializedReducers[reducerName] = false);

const setReducersUninitialized = () =>
  Object.keys(initializedReducers).map(
    name => (initializedReducers[name] = false),
  );

const notify = msg =>
  new Notification('Msg from pouchWorker', {
    body: msg,
    vibrate: [200, 100, 200, 100],
    tag: 'noti sample',
  });

const cancelSync = () =>
  syncHandler && !syncHandler.cancelled
    ? syncHandler.cancel()
    : Promise.resolve(false);

const destroyDBS = reply =>
  DBS.local
    .destroy()
    .then(result => {
      DBS = false;
      reply('destroyd');
      return result;
    })
    .catch(e => {
      // eslint-disable-line
      console.log('DB DESTROY ERROR', e);
      return e;
    });

const resetReducer = async reply => {
  if (DBS) {
    await cancelSync();
    await destroyDBS(reply);
  }
};

const initialSync = reply =>
  DBS.remote.replicate
    .to(DBS.local, { live: false })
    .then(r => {
      // DBS.local.get('RoverView').then((rr) => console.log('initialSyncResult', rr));
      reply({ ...SYNC_INITIAL_SUCCESS });
    })
    .catch(error => reply({ ...SYNC_INITIAL_FAIL, error }));

const syncInitial = async (user, reply) => {
  if (!DBS) {
    DBS = await getDBS(user);
    await initialSync(reply);
  }
};

const initSync = (localDb, remoteDb, docIds) =>
  localDb.replicate
    .to(remoteDb, {
      live: true,
      retry: true,
      since: 'now',
      doc_ids: docIds,
      // batch_size: 20,
      // heartbeat: 10000,
    })
    .on('active', () => {
      console.log('__ACTIVE_W');
    })
    .on('paused', s => {
      console.log('__PAUSED', s);
    })
    .on('change', b => {
      console.log('__CHANGE', b);
    })
    .on('complete', d => {
      console.log('__COMPLETE', d);
    })
    .on('error', e => {
      console.log('__ERROR', e);
    });

// const setUpSyncEvents = handler =>
//   handler
//     .on('active', () => {
//       console.log('__ACTIVE_W');
//     })
//     .on('paused', (s) => {
//       console.log('__PAUSED', s);
//     })
//     .on('change', (b) => {
//       console.log('__CHANGE', b);
//     })
//     .on('complete', (d) => {
//       console.log('__COMPLETE', d);
//     })
//     .on('error', (e) => {
//       console.log('__ERROR', e);
//     });

const setReducer = doc => sendMsgToClient({ doc, ...REDUCER_SET });

const initChanges = (
  db,
  docId,
  save,
  currentState, // eslint-disable-line
) =>
  db
    .changes({
      live: true,
      since: 'now',
      doc_ids: [docId],
      include_docs: true,
      conflicts: true,
    })
    .on('change', change => {
      if (change.doc.localId !== CLIENT_HASH) {
        if (!change.doc.state) {
          save(change.doc._id, currentState);
        } else if (!isEqual(cloneDeep(change.doc.state), currentState)) {
          setReducer(change.doc);
          // .then((re) => {
          //   // console.log('__RE__', re);
          // });
        }
      }
    });

const initFromDB = (db, docName) =>
  db
    .get(docName)
    .then(doc => {
      setReducer(doc);
    })
    .catch(err => err);

const initDBState = async (state, localDb, remoteDb, docName, save) => {
  // eslint-disable-line
  let remoteInitError;
  const localInitError = await initFromDB(localDb, docName);

  if (localInitError && localInitError.status === 404) {
    if (remoteDb) {
      remoteInitError = await initFromDB(remoteDb, docName);
      if (remoteInitError && remoteInitError.status === 404) {
        await save(docName, state);
      }
      return; // eslint-disable-line
    }
    await save(docName, state);
  }
  if (localInitError || remoteInitError) {
    throw Error(localInitError || remoteInitError);
  }
};

const checkReady = (keys, reducers) => {
  let ready = true;
  keys.map(reducerName => {
    // eslint-disable-line
    let exit = false;
    if (!reducers[reducerName] && !exit) {
      ready = false;
      exit = true;
    }
  });
  return ready;
};

const setReady = () => {
  sendMsgToClient({ ...REDUCERS_READY });
};

const setReducerReady = reducerName =>
  sendMsgToClient({ ...REDUCER_READY, reducerName });

async function reinitReducer(reducerName, state, currentState, user) {
  // eslint-disable-line
  // console.log('___REINIT__', reducerName);
  // setReducerUninitialized(reducerName);
  if (changes) {
    changes.cancel();
  }

  if (!DBS) {
    await setDBS(user);
    // DBS = await getDBS(user);
  }

  const dbs = DBS;
  const localDB = dbs.local;
  const remoteDB = dbs.remote;
  const prefetched = state.prefetched || false;

  saveReducer = save(localDB, CLIENT_HASH);

  if (prefetched) {
    await saveReducer(reducerName, cloneDeep(state));
  } else {
    await initDBState(state, localDB, remoteDB, reducerName, saveReducer);
  }

  setReducerInitialized(reducerName);

  const initializedReducerKeys = Object.keys(initializedReducers);
  const ready = checkReady(initializedReducerKeys, initializedReducers);

  if (ready && !syncInit) {
    syncInit = true;
    syncHandler = initSync(localDB, remoteDB, initializedReducerKeys);
    setReady();
    notify('dbs are set up and synced');
  }
  changes = initChanges(localDB, reducerName, saveReducer, currentState);
  setReducerReady(reducerName);
}

const handleMsg = async e => {
  const {
    ports: [replyPort],
    data: { user, type, state, currentState, nextState, reducerName },
  } = e;
  const reply = msg => replyPort.postMessage(msg);
  const workerName = self.name || 'pouchWorker';
  const hello = `hola, ${workerName} is here to work for you, send me msg's and i'll reply`;
  console.log('MSG::', type);
  // const payload = { user, type, state, currentState, nextState, reducerName, reply };
  // _handler[type](payload);
  if (type) {
    switch (type) {
      case STORE_INIT.type:
        reply(hello);
        break;

      case REDUCER_REINIT.type:
        reinitReducer(reducerName, state, currentState, user);
        break;

      case REDUCER_CHANGE.type:
        saveReducer(reducerName, nextState);
        // reply('ack');
        break;

      case REDUCER_RESET.type:
        await resetReducer(reply);
        setReducersUninitialized();
        break;

      case SYNC_INITIAL.type:
        syncInitial(user, reply);
        break;

      case REDUCER_REGISTER.type:
        // console.log('__REGISTER__', reducerName);
        setReducerUninitialized(reducerName);
        break;

      default:
        reply('no matching action found');
        break;
    }
  }
};

self.addEventListener('message', e => handleMsg(e));
