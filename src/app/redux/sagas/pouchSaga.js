import { take, put, call, fork, select } from 'redux-saga/effects';
import { eventChannel /* , delay */ } from 'redux-saga';

import {
  initWorkerSync,
  currySendMsg,
  hasWindow,
} from '../../../app/workers/utils';
import { REQUEST_REINIT, REINIT } from '../../../redux-pouchdb-plus/src/index';
import {
  SYNC_INITIAL,
  SYNC_INITIAL_SUCCESS,
  /* SYNC_INITIAL_FAIL, */ STORE_INIT,
} from '../../workers/pouchWorkerMsgTypes';

import { LOGIN_SUCCESS, SIGNUP_SUCCESS } from '../modules/user';

function* reinitFlow(client) {
  const pouchWorker = yield call(
    initWorkerSync,
    '/worker.pouch.js',
    'pouchWorker',
  );
  const sendMsgToWorker = currySendMsg(pouchWorker);
  while (true) {
    // eslint-disable-line
    const reinitReducerTypes = [SIGNUP_SUCCESS, LOGIN_SUCCESS];
    yield take(reinitReducerTypes);
    yield put({ type: REQUEST_REINIT });
    const state = yield select();
    const msg = { user: state.user, ...SYNC_INITIAL };
    // const sendMsg = state.app.sendMsgToWorker;
    yield put(SYNC_INITIAL);
    yield call(sendMsgToWorker, msg);
    yield put(SYNC_INITIAL_SUCCESS);
    // console.log('__III__', ii);
    yield put({ type: REINIT });
  }
}

// function* reinitOnLogin(client) {
//   while (true) {// eslint-disable-line
//     const reinitReducerTypes = [SIGNUP_SUCCESS, LOGIN_SUCCESS];
//     yield take(reinitReducerTypes);
//     yield put({ type: REQUEST_REINIT });
//     const state = yield select();
//     const msg = { user: state.user, ...SYNC_INITIAL };
//     //
//     const sendMsg = state.app.sendMsgToWorker;
//     yield put(SYNC_INITIAL);
//     yield call(sendMsg, msg);
//     yield put(SYNC_INITIAL_SUCCESS);
//     // console.log('__III__', ii);
//     // promise
//     yield put({ type: REINIT });
//   }
// }

const createWorkerOnMessageHandler = worker =>
  eventChannel(emit => {
    worker.onmessage = e => {
      const data = e.data;
      const port = e.ports[0];
      emit({ data, port });
    };

    // tslint:disable-next-line:no-empty
    const unsubscribe = () => {};
    return unsubscribe;
  });

function* replyToWorkerMsg(msg) {
  yield put({ type: '__REPLY__TO__WORKER__', msg });
}

function* pingHandler() {
  if (hasWindow()) {
    const pouchWorker = yield call(
      initWorkerSync,
      '/worker.pouch.js',
      'pouchWorker',
    );
    const sendMsgToWorker = currySendMsg(pouchWorker);
    const workerOnMessageHandler = yield call(
      createWorkerOnMessageHandler,
      pouchWorker,
    );
    const res = yield call(sendMsgToWorker, { ...STORE_INIT }); // eslint-disable-line
    while (true) {
      // eslint-disable-line
      const { data: workerMsg, port } = yield take(workerOnMessageHandler);
      const d = { ...workerMsg, ...port };
      yield put({ type: 'GOT_WORKER_MSG', d });
      yield fork(replyToWorkerMsg, 'replyMsg');
    }
  }
}

export { reinitFlow, pingHandler };
