import deepEqual from 'deep-equal';
import uuid from 'uuid';

import { getDBS, DBS, DocModel, POUCH } from '../helpers/getUserDBS';
import { save } from '../redux-pouchdb-plus/src/save';
import { currySendMsg, PouchWorkerAction } from './utils';

import { POUCH_WORKER_TYPES } from './pouchWorkerTypes';
import { NetworkInterfaceBase } from 'os';
import { UserState } from '../app/redux/modules/user';
import { port } from 'src/config/appConfig';

type WorkerActionTypes =
  | POUCH_WORKER_TYPES.STORE_INIT
  | POUCH_WORKER_TYPES.REDUCER_REINIT
  | POUCH_WORKER_TYPES.REDUCER_CHANGE
  | POUCH_WORKER_TYPES.REDUCER_RESET
  | POUCH_WORKER_TYPES.SYNC_INITIAL
  | POUCH_WORKER_TYPES.REINIT_REDUCERS;

interface InitializedReducers {
  [reducer: string]: boolean;
}

let DB: DBS;
let changes: PouchDB.Core.Changes<DocModel>;
let syncInit;
let syncHandler: PouchDB.Replication.Replication<DocModel>;
let saveReducer;
let initialSynced;
let initialSyncing = false;

const CLIENT_HASH = uuid.v1();
let LOCAL_DB_ID: string;
const initializedReducers: InitializedReducers = {};
const sendMsgToClient = currySendMsg(self as any);

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
  syncHandler ? syncHandler.cancel() : Promise.resolve(false);

const destroyDBS = reply =>
  DB.local
    .destroy()
    .then(result => {
      reply(result);
    })
    .catch(e => {
      console.log('DB DESTROY ERROR', e);
      reply(e);
      return e;
    });

const resetReducer = async reply => {
  if (DB) {
    await cancelSync();
    await destroyDBS(reply);
  }
};

const initialSync = reply =>
  DB.remote.replicate
    .to(DB.local, { live: false, doc_ids: ['RoverView', 'SolView'] })
    .then(r =>
      reply({ type: POUCH_WORKER_TYPES.SYNC_INITIAL_SUCCESS, data: r }),
    )
    .catch(error =>
      reply({ type: POUCH_WORKER_TYPES.SYNC_INITIAL_FAIL, error }),
    );

const syncInitial = async (user, reply) => {
  initialSyncing = true;
  if (!DB) {
    DB = await getDBS(user);
  }
  await initialSync(reply);
  initialSyncing = false;
  initialSynced = true;
};

interface InitSyncData {
  docIds: string[];
  localDB: POUCH;
  remoteDB: POUCH;
}
const initSync = ({ docIds, localDB, remoteDB }: InitSyncData) =>
  localDB.replicate
    .to(remoteDB, {
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

const setReducer = (doc: DocModel) =>
  sendMsgToClient({ doc, type: POUCH_WORKER_TYPES.REDUCER_SET });

const initChanges = (db: POUCH, docId: string, save, currentState) =>
  db
    .changes({
      live: true,
      since: 'now',
      doc_ids: [docId],
      include_docs: true,
      conflicts: true,
    })
    .on('change', change => {
      if (change.doc.localId !== LOCAL_DB_ID) {
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

const initFromDB = (
  db: POUCH,
  docName: string,
): Promise<DocModel | Error & { status: number }> =>
  db
    .get(docName, {
      revs: true,
      revs_info: true,
    })
    .then(doc => {
      setReducer(doc);
      return doc;
    })
    .catch(err => err);

const initDBState = async (
  localDb: POUCH,
  remoteDb: POUCH,
  docName: string,
): Promise<DocModel | void> => {
  let remoteInitResult;
  const localInitResult = await initFromDB(localDb, docName);
  if (localInitResult) {
    if ('_id' in localInitResult) {
      return localInitResult;
    }
    if (localInitResult.status === 404) {
      if (remoteDb) {
        remoteInitResult = await initFromDB(remoteDb, docName);
        if (remoteInitResult && '_id' in remoteInitResult) {
          return remoteInitResult;
        }
      }
    }
  }

  // if (localInitResult || remoteInitResult) {
  //   throw Error(localInitResult || remoteInitResult);
  // }
};

const checkReady = (reducers: InitializedReducers) =>
  Object.values(reducers).every(reducer => reducer);

const setReady = () => {
  sendMsgToClient({ type: POUCH_WORKER_TYPES.REDUCERS_READY });
};

const setReducerReady = reducerName =>
  sendMsgToClient({
    type: POUCH_WORKER_TYPES.REDUCER_READY,
    reducerName,
  });

async function reinitReducer(
  reducerName: string,
  state,
  currentState,
  user: UserState,
  { reply, reinitReducersReply }: { reply: Reply; reinitReducersReply: Reply },
) {
  setReducerUninitialized(reducerName);
  if (changes) {
    changes.cancel();
  }

  // if (!initialSynced) {
  //   await syncInitial(user, reply);
  // }

  let doc: DocModel | void;
  const localDB = DB.local;
  const remoteDB = DB.remote;
  const prefetched = state.prefetched || false;

  LOCAL_DB_ID = state.localDbId || false;

  // add doc.localId to state for prefetched case
  // saveReducer = save(localDB, CLIENT_HASH);

  // if (prefetched) {
  //   await saveReducer(reducerName, state);
  // } else {

  doc = await initDBState(localDB, remoteDB, reducerName);
  if (doc && 'localId' in doc) {
    LOCAL_DB_ID = doc.localId;
  } else {
    LOCAL_DB_ID = uuid.v1();
  }

  saveReducer = save(localDB, LOCAL_DB_ID);
  await saveReducer(reducerName, state);

  const initializedReducerKeys = Object.keys(initializedReducers);
  setReducerInitialized(reducerName);
  const ready = checkReady(initializedReducers);

  if (ready && !syncInit) {
    syncInit = true;
    syncHandler = initSync({
      docIds: initializedReducerKeys,
      localDB,
      remoteDB,
    });
    // setReady();
    reinitReducersReply('all ready');
    // _syncInitialReply('dbs are set up and synced');
  }
  changes = initChanges(localDB, reducerName, saveReducer, currentState);
  reply(reducerName);
  setReducerReady(reducerName);
}

const stateCache = new Map();
let reinitReducersReply: Reply;
type Reply = (msg: string | PouchWorkerAction) => void;

const handleMsg = async (e: MessageEvent) => {
  const {
    ports: [replyPort],
    data: { user, type, state, currentState, nextState, reducerName },
  }: { data: PouchWorkerAction; ports: ReadonlyArray<MessagePort> } = e;
  const reply: Reply = (msg: PouchWorkerAction | string) =>
    replyPort.postMessage(msg);

  const workerName = (self as any).name || 'pouchWorker';
  const hello = `hola, ${workerName} is here to work for you, send me msg's and i'll work it out`;

  // const payload = { user, type, state, currentState, nextState, reducerName, reply };
  // _handler[type](payload);
  if (type) {
    switch (type as WorkerActionTypes) {
      case POUCH_WORKER_TYPES.STORE_INIT:
        reply(hello);
        break;

      case POUCH_WORKER_TYPES.REINIT_REDUCERS:
        reinitReducersReply = reply;
        break;

      case POUCH_WORKER_TYPES.REDUCER_REINIT:
        reinitReducer(reducerName, state, currentState, user, {
          reply,
          reinitReducersReply,
        });
        break;

      case POUCH_WORKER_TYPES.REDUCER_CHANGE:
        const _prevState = stateCache.get(reducerName);
        if (!_prevState || !deepEqual(_prevState, nextState)) {
          saveReducer(reducerName, nextState);
        }
        stateCache.set(reducerName, nextState);
        // reply('ack');
        break;

      case POUCH_WORKER_TYPES.REDUCER_RESET:
        await resetReducer(reply);
        setReducersUninitialized();
        break;

      case POUCH_WORKER_TYPES.SYNC_INITIAL:
        await syncInitial(user, reply);
        // reply('done');
        break;

      default:
        reply('no matching action found');
        break;
    }
  }
};

self.addEventListener('message', e => handleMsg(e));
