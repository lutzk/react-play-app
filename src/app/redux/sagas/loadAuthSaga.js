import {
  take,
  put,
  call,
  fork,
  /* cancel, select */ cancelled,
} from 'redux-saga/effects';

import { LOAD_AUTH, LOAD_AUTH_SUCCESS, LOAD_AUTH_FAIL } from '../modules/user';

function* loadAuth(promise, client) {
  try {
    const result = yield call(promise, client);
    yield put({ type: LOAD_AUTH_SUCCESS, result });
    return result;
  } catch (error) {
    yield put({ type: LOAD_AUTH_FAIL, error });
  } finally {
    if (yield cancelled()) {
      // ... put special cancellation handling code here
    }
  }
}

function* redirectToLogin(promise, client) {
  try {
    const result = yield call(promise, client);
    yield put({ type: LOAD_AUTH_SUCCESS, result });
    return result;
  } catch (error) {
    yield put({ type: LOAD_AUTH_FAIL, error });
  } finally {
    if (yield cancelled()) {
      // ... put special cancellation handling code here
    }
  }
}

function* loadAuthFlow(client) {
  while (true) {
    const { promise } = yield take(LOAD_AUTH);
    // const task = yield fork(loadAuth, promise, client);
    // const action = yield take([LOAD_AUTH_FAIL]);
    // const action = yield take([LOAD_AUTH_SUCCESS]);
    // if (Object.keys(action.result).length === 0) {

    // }
    // if (action.type === LOGOUT) {
    //   yield cancel(task);
    // }
    // yield call(Api.clearItem, 'token')
  }
}

export { loadAuthFlow };
