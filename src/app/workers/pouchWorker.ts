import deepEqual from 'deep-equal';
import uuid from 'uuid';

import { getDBS } from '../../helpers/getUserDBS';
import { save } from '../../redux-pouchdb-plus/src/save';
import { currySendMsg } from './utils';

import {
  REDUCER_CHANGE,
  REDUCER_READY,
  REDUCER_REGISTER,
  REDUCER_REINIT,
  REDUCER_RESET,
  REDUCER_SET,
  REDUCERS_READY,
  STORE_INIT,
  SYNC_INITIAL,
  SYNC_INITIAL_FAIL,
  SYNC_INITIAL_SUCCESS,
} from './pouchWorkerMsgTypes';

interface InitializedReducers {
  [reducer: string]: boolean;
}

let DBS;
let changes;
let syncInit;
let syncHandler;
let saveReducer;

const CLIENT_HASH = uuid.v1();
const initializedReducers: InitializedReducers = {};
// const reducers = {};
const sendMsgToClient = currySendMsg(self);

// let settingDBS = false;
// const setDBS = async user => {
//   if (!settingDBS) {
//     settingDBS = true;
//     DBS = await getDBS(user);
//     settingDBS = false;
//   }
// };

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
      reply(result);
      return result;
    })
    .catch(e => {
      console.log('DB DESTROY ERROR', e);
      reply(e);
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
      console.log('NANANA');
      // DBS.local.get('RoverView').then((rr) => console.log('initialSyncResult', rr));
      reply({ ...SYNC_INITIAL_SUCCESS });
    })
    .catch(error => reply({ ...SYNC_INITIAL_FAIL, error }));

const syncInitial = async (user, reply) => {
  console.log('INI SYNC 1');
  if (!DBS) {
    console.log('INI SYNC 2');
    DBS = await getDBS(user);
    // await initialSync(reply);
  }
  // else {
  //   reply('INI SYNC');
  // }
  await initialSync(reply);
  // reply('INI SYNC');
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
const initChanges = (db, docId, save, currentState) =>
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
        } else if (!deepEqual(change.doc.state, currentState)) {
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
  let remoteInitError;
  const localInitError = await initFromDB(localDb, docName);
  if (localInitError && localInitError.status === 404) {
    if (remoteDb) {
      remoteInitError = await initFromDB(remoteDb, docName);
      if (remoteInitError && remoteInitError.status === 404) {
        await save(docName, state);
      }
      return;
    }
    await save(docName, state);
  }
  if (localInitError || remoteInitError) {
    throw Error(localInitError || remoteInitError);
  }
};

const checkReady = (reducers: InitializedReducers) =>
  Object.values(reducers).every(reducer => reducer);

const setReady = () => {
  sendMsgToClient({ ...REDUCERS_READY });
};

const setReducerReady = reducerName =>
  sendMsgToClient({ ...REDUCER_READY, reducerName });

async function reinitReducer(
  reducerName,
  state,
  currentState,
  user,
  { reply, syncInitialReply },
) {
  setReducerUninitialized(reducerName);
  if (changes) {
    changes.cancel();
  }

  await syncInitial(user, reply);

  // if (!DBS) {
  //   await setDBS(user);
  // }

  const dbs = DBS;
  const localDB = dbs.local;
  const remoteDB = dbs.remote;
  const prefetched = state.prefetched || false;

  saveReducer = save(localDB, CLIENT_HASH);

  if (prefetched) {
    await saveReducer(reducerName, state);
  } else {
    await initDBState(state, localDB, remoteDB, reducerName, saveReducer);
  }
  const initializedReducerKeys = Object.keys(initializedReducers);
  setReducerInitialized(reducerName);
  const ready = checkReady(initializedReducers);

  if (ready && !syncInit) {
    syncInit = true;
    syncHandler = initSync(localDB, remoteDB, initializedReducerKeys);
    setReady();
    // notify('dbs are set up and synced');
    _syncInitialReply('dbs are set up and synced');
  }
  changes = initChanges(localDB, reducerName, saveReducer, currentState);
  reply(reducerName);
  setReducerReady(reducerName);
}

const stateCache = new Map();
let _syncInitialReply;
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
        console.log('REDUCER_REINIT.type');
        reinitReducer(reducerName, state, currentState, user, {
          reply,
          syncInitialReply: _syncInitialReply,
        });
        break;

      case REDUCER_CHANGE.type:
        const _prevState = stateCache.get(reducerName);
        if (!_prevState || !deepEqual(_prevState, nextState)) {
          saveReducer(reducerName, nextState);
        }
        stateCache.set(reducerName, nextState);
        // reply('ack');
        break;

      case REDUCER_RESET.type:
        await resetReducer(reply);
        setReducersUninitialized();
        break;

      case SYNC_INITIAL.type:
        console.log('SYNC_INITIAL');
        _syncInitialReply = reply;
        // syncInitial(user, reply);
        break;

      // case REDUCER_REGISTER.type:
      //   setReducerUninitialized(reducerName);
      //   break;

      default:
        reply('no matching action found');
        break;
    }
  }
};

self.addEventListener('message', e => handleMsg(e));
