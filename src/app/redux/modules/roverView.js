import { persistentReducer } from '../../../redux-pouchdb-plus/src/index';
import { startLoading, endLoading } from './pageLoadBar';

import {
  rovers,
  spirit,
  sortList,
  _updateList,
  getManifestFor,
} from './shared/shared';

const GET_MANIFEST = 'roverView/GET_MANIFEST';
const GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS';
const GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL';

// const SHOW_MORE_SOLS = 'roverView/SHOW_MORE_SOLS';
// const SHOW_LESS_SOLS = 'roverView/SHOW_LESS_SOLS';

const SORT_SOLS = 'roverView/SORT_SOLS';

const roverMatcher = roverToMatch =>
  Object.keys(rovers).indexOf(roverToMatch) > -1;

const availableSorts = { fields: ['sol', 'totalPhotos', 'cameras'], orders: ['asc', 'desc'] };
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

const initialState = {
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

const getStats = (data) => {
  const stats = { ...data };
  delete stats.name;
  delete stats.photos;
  return stats;
};

function roverView(state = initialState, action = {}) {
  switch (action.type) {

    case '@@redux-pouchdb-plus/RESET':
      return {
        ...initialState,
      };

    case '@@redux-pouchdb-plus/REDUCER_READY':
      if (action.reducerName === 'roverView') {
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

    // case '@@redux-pouchdb-plus/INIT':
    //   if (action.state.roverView.prefetched) {
    //     return {
    //       ...state,
    //     };
    //   }
    //   return {
    //     ...state,
    //   };

    case '@@redux-pouchdb-plus/REINIT':
      return {
        ...state,
        reinitializing: true,
        reinitRequested: false,
        ready: false,
      };

    case '@@redux-pouchdb-plus/REQUEST_REINIT':
      return {
        ...state,
        reinitRequested: true,
        ready: false,
      };

    case SORT_SOLS:
      return {
        ...state,
        listToRender: action.list,
        sorts: action.sorts,
        filter: action.filter,
        range: action.range,
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
        maxSol: action.result.photoManifest.photos[action.result.photoManifest.photos.length - 1].sol,
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
}

const getManifest = (_rover, offline) => {

  const rover = _rover || initialState.defaultRover;
  const types = [GET_MANIFEST, GET_MANIFEST_SUCCESS, GET_MANIFEST_FAIL];

  return getManifestFor({
    rover,
    types,
    offline,
  });
};

const updateList = ({ sorts, filter, range } = {}) => {
  const type = SORT_SOLS;
  const stateKey = 'roverView';
  return _updateList({ type, stateKey, sorts, filter, range });
};

const initPage = ({ waiter, store, rover, readyListener }) => (dispatch) => {
  const NAME = 'RoverView';
  const roverViewState = store.getState().roverView;
  const getRover = () => roverMatcher(rover) ? rover : roverViewState.defaultRover;

  if (roverViewState.loaded) {
    return NAME;

  } else if (roverViewState.reinitializing || roverViewState.reinitRequested) {
    dispatch(startLoading());
    const unsubscribe = store.subscribe(readyListener(store));

    return waiter.then((name) => {
      unsubscribe();
      if (!store.getState().roverView.loaded) {
        const _rover = getRover();
        return dispatch(getManifest(_rover, true))
          .then(dispatch(endLoading()))
          .then(NAME);
      }

      return dispatch(endLoading())
        .then(() => name);
    });
  }

  const _rover = getRover();
  return dispatch(getManifest(_rover, true)).then(NAME);
};


const roverViewReducer = persistentReducer(roverView);

export {
  initPage,
  updateList,
  getManifest,
  roverMatcher,
  roverViewReducer,
};
