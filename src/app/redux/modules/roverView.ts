import { AnyAction, Reducer } from 'redux';
import { persistentReducer } from '../../../redux-pouchdb-plus/src/index';
import { endLoading, startLoading } from './pageLoadBar';
// import { Deferred } from '../../../helpers/deferred';

import {
  _updateList,
  getManifestFor,
  rovers,
  sortList,
  spirit,
} from './shared/shared';

const reducerName = 'RoverView';

const SORT_SOLS = 'roverView/SORT_SOLS';
const GET_MANIFEST = 'roverView/GET_MANIFEST';
const GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS';
const GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL';

interface RoverViewState {
  rover: any;
  error: any;
  rovers: any;
  loaded: boolean;
  loading: boolean;
  roverName: string;
  listLength: number;
  list: any;
  listToRender: any;
  missionStats: any;
  maxShown: boolean;
  maxSol: number;
  defaultRover: string; // rovers[spirit.label];
  moreShown: boolean;
  sorts: any;
  filter: any;
  defaultSorts: any;
  range: any; // defaultRange,
  reducerName?: string;
}

interface RoverResult {
  photoManifest: any;
}

interface RoverViewAction extends AnyAction {
  reducerName: string;
  range: any;
  sorts: any;
  filter: any;
  list: any;
  result: RoverResult;
  error: any;
}

const roverMatcher = roverToMatch =>
  Object.keys(rovers).indexOf(roverToMatch) > -1;

const availableSorts = {
  fields: ['sol', 'totalPhotos', 'cameras'],
  orders: ['asc', 'desc'],
};
const defaultSorts = { fields: ['sol'], orders: ['asc', 'desc'] };
const defaultFilter = {
  fields: {
    sol: {
      value: 0,
      on: false,
    },
    totalPhotos: {
      value: 0,
      on: false,
    },
    cameras: {
      value: '',
      on: false,
    },
  },
  on: false,
};

const initialCount = 15;

const defaultRange = {
  start: 0,
  end: initialCount,
  initialCount,
  on: true,
};

const initialState: RoverViewState = {
  rover: null,
  error: null,
  rovers,
  loaded: false,
  loading: false,
  roverName: null,
  listLength: 0,
  list: null,
  listToRender: null,
  missionStats: null,
  maxShown: false,
  maxSol: null,
  defaultRover: rovers[spirit.label],
  moreShown: false,
  sorts: availableSorts,
  filter: defaultFilter,
  defaultSorts,
  range: defaultRange,
};

const getStats = data => {
  const stats = { ...data };
  delete stats.name;
  delete stats.photos;
  return stats;
};

const roverView: Reducer<RoverViewState> = (
  state = initialState,
  action: RoverViewAction,
) => {
  switch (action.type) {
    // case '@@redux-pouchdb-plus/INIT':
    //   // if (action.state.solView.prefetched) {
    //   //   return {
    //   //     ...state,
    //   //     prefetched: false,
    //   //   };
    //   // }
    //   console.log('_ACTION_', action);
    //   return {
    //     pouchWorker: action.pouchWorker,
    //     sendMsgToWorker: action.sendMsgToWorker,
    //     ...state,
    //   };

    case '@@redux-pouchdb-plus/RESET':
      return {
        ...initialState,
      };

    case '@@redux-pouchdb-plus/REDUCER_READY':
      if (action.reducerName === reducerName) {
        return {
          ...state,
          ready: true,
          prefetched: false,
          reinitializing: false,
        };
      }
      return {
        ...state,
      };

    case '@@redux-pouchdb-plus/REINIT':
      return {
        ...state,
        ready: false,
        reinitializing: true,
        reinitRequested: false,
      };

    case '@@redux-pouchdb-plus/REQUEST_REINIT':
      return {
        ...state,
        ready: false,
        reinitRequested: true,
      };

    case SORT_SOLS:
      return {
        ...state,
        range: action.range,
        sorts: action.sorts,
        filter: action.filter,
        listToRender: action.list,
      };

    case GET_MANIFEST:
      return {
        ...state,
        loading: true,
        loaded: false,
      };

    case GET_MANIFEST_SUCCESS:
      return {
        ...state,
        rover: action.result.photoManifest.name.toLowerCase(),
        error: null,
        loaded: true,
        loading: false,
        maxSol:
          action.result.photoManifest.photos[
            action.result.photoManifest.photos.length - 1
          ].sol,
        roverName: action.result.photoManifest.name,
        listLength: action.result.photoManifest.photos.length,
        list: action.result.photoManifest.photos,
        missionStats: getStats(action.result.photoManifest),
        listToRender: sortList({
          list: action.result.photoManifest.photos,
          sorts: state.sorts,
          filter: state.filter,
          range: state.range,
        }),
      };

    case GET_MANIFEST_FAIL:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
      };

    default:
      return state;
  }
};

const getManifest = (roverName, offline) => {
  const rover = roverName || initialState.defaultRover;
  const types = [GET_MANIFEST, GET_MANIFEST_SUCCESS, GET_MANIFEST_FAIL];

  return getManifestFor({
    rover,
    types,
    offline,
  });
};

const updateList = ({ sorts, filter, range }: any = {}) => {
  const type = SORT_SOLS;
  const stateKey = 'roverView';
  return _updateList({ type, stateKey, sorts, filter, range });
};

// const subscribeWaiter = (waiter, store, selector, result) =>
//   store => () => {// eslint-disable-line
//     if (selector(store.getState())) {
//       waiter.resolve(result);
//     }
//   };

const initPage = () => (dispatch, getState) => {
  const {
    location: {
      payload: { rover },
    },
  } = getState();
  console.log('__RVI__', 0.1, rover);
  const NAME = reducerName;
  const roverViewState = getState().roverView;
  const getRover = () =>
    roverMatcher(rover) ? rover : roverViewState.defaultRover;
  console.log('__RVI__', 1, getRover());
  if (roverViewState.loaded) {
    console.log('__RVI__', 2);
    if (roverViewState.roverName !== rover) {
      console.log('__RVI__', 2.1);
      // const _rover = getRover();
      return dispatch(getManifest(getRover(), false))
        .then(dispatch(endLoading()))
        .then(NAME);
    }
    dispatch(endLoading());
    return NAME;
  }
  if (roverViewState.reinitializing || roverViewState.reinitRequested) {
    console.log('__RVI__', 3);
    // const waiter = new Deferred();
    // const selector = state => state.roverView.ready;
    // const unsubscribe = store.subscribe(
    //   subscribeWaiter(waiter, store, selector, NAME)(store));

    dispatch(startLoading());

    // return waiter.then((name) => {
    //   unsubscribe();
    //   console.log('__RVI__', 4);
    if (!getState().roverView.loaded) {
      // const _rover = getRover();
      return dispatch(getManifest(getRover(), false))
        .then(dispatch(endLoading()))
        .then(NAME);
    }
    console.log('__RVI__', 5);
    return dispatch(endLoading()).then(() => NAME);
    // });
  }
  console.log('__RVI__', 6);
  // const _rover = getRover();
  return dispatch(getManifest(getRover(), false))
    .then(() => dispatch(endLoading()))
    .then(NAME);
};

const roverViewReducer = persistentReducer(roverView, reducerName);

export {
  RoverViewState,
  RoverViewAction,
  initPage,
  updateList,
  getManifest,
  roverMatcher,
  roverViewReducer,
  GET_MANIFEST,
  GET_MANIFEST_SUCCESS,
  GET_MANIFEST_FAIL,
};
