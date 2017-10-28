import { all } from 'redux-saga/effects';

import { loginFlow } from './loginSaga';
import { reinitFlow, pingHandler } from './pouchSaga';
import { loadAuthFlow } from './loadAuthSaga';
import { initPageFlow } from './roverViewSaga';
import {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
} from '../modules/user';

const getRootSaga = client => function* rootSaga() {
  yield all([
    pingHandler(),
    loginFlow(client),
    reinitFlow(client),
    loadAuthFlow(client),
    initPageFlow(client),
  ]);
};

export {
  getRootSaga,
};

