// import { Deferred } from '../../../helpers/deferred';
import { take, put, call, fork, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import {
  LOADING,
  END_LOADING,
  // RESET_LOADING,
  // END_LOADING_FROM_ERROR,
} from '../modules/pageLoadBar';

import {
  roverMatcher,
  GET_MANIFEST,
  GET_MANIFEST_SUCCESS,
  GET_MANIFEST_FAIL,
} from '../modules/roverView';

// import { REDUCER_READY } from '../../../redux-pouchdb-plus/src/index';

function* getManifestFor({ client, rover, offline, sol }) {// eslint-disable-line
  try {
    const params = { rover, offline, sol };
    const requestPath = '/nasa';
    const promise = client => client.get(requestPath, { params });// eslint-disable-line
    yield put({ type: GET_MANIFEST });
    yield put({ type: LOADING });
    const result = yield call(promise, client);
    yield put({ type: GET_MANIFEST_SUCCESS, result });
    yield put({ type: END_LOADING });
  } catch (error) {
    yield put({ type: GET_MANIFEST_FAIL, error });
    yield put({ type: END_LOADING });
  }
}

const getRover = (rover, state) => roverMatcher(rover) ? rover : state.defaultRover;
// const roverReadySelector = state => state.roverView.ready;
// const roverLoadedSelector = state => state.roverView.loaded;
// const roverLoadingSelector = state => state.roverView.loading;

const roverNotReadySelector = state => !state.roverView.ready;
// const roverNotLoadedSelector = state => !state.roverView.loaded;
// const roverNotLoadingSelector = state => !state.roverView.loading;

// const subscribeWaiter = (waiter, store, selector, result) =>
//   store => () => {// eslint-disable-line
//     if (selector(store.getState())) {
//       waiter.resolve(result);
//     }
//   };

// return waiter.then((name) => {
//   unsubscribe();
//   console.log('__RVI__', 4);
//   if (!store.getState().roverView.loaded) {
//     const _rover = getRover();
//     return dispatch(getManifest(_rover, true))
//           .then(dispatch(endLoading()))
//           .then(NAME);
//   }
//   console.log('__RVI__', 5);
//   return dispatch(endLoading())
//         .then(() => name);
// });
// const waiter = new Deferred();
// const selector = state => state.roverView.ready;
// const unsubscribe = store.subscribe(
//   subscribeWaiter(waiter, store, selector, NAME)(store));

// dispatch(startLoading());
let coun = 0;
function* waitForRoverReady({ client, rover }) {// eslint-disable-line
  if (yield select(roverNotReadySelector)) {// eslint-disable-line
    console.log('__RVI__', 5);
    // if (yield select(roverNotLoadingSelector)) {
    //   console.log('__RVI__', 5.1);
    //   yield put({ type: LOADING });
    //   yield call(getManifestFor, { client, rover, offline: true });
    //   // return;
    // }
    yield call(delay, 100);
    if (coun < 20) {
      coun += 1;
      return yield call(waitForRoverReady, { client, rover });
    }
    return true;
  }
  return true;
}

function* initPageFlow(client) {

  // const roverViewChannel = yield actionChannel('ROVER_VIEW');
  // const roverReadyChannel = yield actionChannel('@@redux-pouchdb-plus/REINIT_SUCCESS');

  while (yield take('ROVER_VIEW')) {// eslint-disable-line
    // debugger;// eslint-disable-line
    console.log('__RVI__', 1);
    // const { action } = yield take('ROVER_VIEW');
    // const action = yield take(roverViewChannel);
    yield put({ type: LOADING });
    const state = yield select();
    const { location: { payload: { rover } } } = state;
    // const NAME = 'RoverView';
    const roverViewState = state.roverView;
    console.log('__STATE__', { ...roverViewState });
    const _rover = getRover(rover, roverViewState);
    console.log('__RVI__', 1.1);
    if (roverViewState.loaded) {
      console.log('__RVI__', 2);
      yield put({ type: END_LOADING });

    } else if (roverViewState.reinitializing || roverViewState.reinitRequested) {
      console.log('__RVI__', 3);
      yield put({ type: LOADING });
      console.log('__RVI__', 4);
      // const roverLoaded = yield select(roverLoadedSelector);
      yield call(waitForRoverReady, { client, rover: _rover });
      // while (yield select(roverNotLoadedSelector)) {
      //   console.log('__RVI__', 5);
      //   if (yield select(roverNotLoadingSelector)) {
      //     console.log('__RVI__', 5.1);
      //     yield put({ type: LOADING });
      //     yield call(getManifestFor, { client, rover: _rover, offline: true });
      //   }
      // }
      console.log('__RVI__', 6);
      yield put({ type: END_LOADING });

      // const sa = yield take();
      // console.log('__RVI__', 3.2);
      // console.log('___WILD___', sa);
      // missed
      // const su = yield take('@@redux-pouchdb-plus/REINIT_SUCCESS');
      // const roverLoaded = yield select(roverLoadedSelector);
      // const readyAction = yield takeEvery('@@redux-pouchdb-plus/REINIT_SUCCESS', ro, client, _rover);
      // if (reducerName) {
      // console.log('__RVI__', 4);
      // if (!roverLoaded) {
      //   console.log('__RVI__', 5);
      //   // const readyAction = yield take(roverReadyChannel);
      //   // console.log('__RVI__', 5.1);
      //   // yield put({ type: LOADING });
      //   yield fork(getManifestFor, { client, rover: _rover, offline: true });
      //   // yield put({ type: END_LOADING });
      //   console.log('__RVI__', 5.1);
      // } else {
      //   console.log('__RVI__', 6);
      //   yield put({ type: END_LOADING });
      // }
      // }
    } else {
      console.log('__RVI__', 7);
      yield fork(getManifestFor, { client, rover: _rover, offline: true });
      yield put({ type: END_LOADING });
    }
  }
}

export {
  initPageFlow,
};
