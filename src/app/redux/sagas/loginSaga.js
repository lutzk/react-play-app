import { take, put, call, fork, cancel, cancelled } from 'redux-saga/effects';

import {
  LOADING,
  END_LOADING,
  RESET_LOADING,
  END_LOADING_FROM_ERROR,
} from '../modules/pageLoadBar';

import {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
} from '../modules/user';

function* authorize({ promise, client }) {
  try {
    yield put({ type: LOADING });
    const result = yield call(promise, client);
    yield put({ type: LOGIN_SUCCESS, result });
    return result;
  } catch (error) {
    yield put({ type: LOGIN_FAIL, error });
  } finally {
    yield put({ type: END_LOADING });
    if (yield cancelled()) {
      // ... put special cancellation handling code here
    }
  }
}

function* logout({ promise, client }) {
  try {
    yield put({ type: LOADING });
    const result = yield call(promise, client);
    yield put({ type: LOGOUT_SUCCESS, result });
    return result;
  } catch (error) {
    yield put({ type: LOGOUT_FAIL, error });
  } finally {
    yield put({ type: END_LOADING });
    if (yield cancelled()) {
      // ... put special cancellation handling code here
    }
  }
}

function* loginFlow(client) {
  while (true) {
    const { promise } = yield take(LOGIN);
    let logoutTask;
    const loginTask = yield fork(authorize, { promise, client });
    const action = yield take([LOGOUT, LOGIN_FAIL]);
    if (action.type === LOGOUT) {
      yield cancel(loginTask);
      const { promise: logoutPromise } = action;
      logoutTask = yield fork(logout, { promise: logoutPromise, client });
      const logoutFailAction = yield take([LOGOUT_FAIL]);
      if (logoutFailAction) {
        yield cancel(logoutTask);
      }
    }
  }
}

export { loginFlow };
