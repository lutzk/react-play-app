import { persistentReducer } from 'redux-pouchdb';
import {
  rovers,
  spirit,
  sortList,
  _updateList,
  getManifestFor,
} from './shared/shared';

export const GET_MANIFEST = 'roverView/GET_MANIFEST';
export const GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS';
export const GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL';
export const SHOW_MORE_SOLS = 'roverView/SHOW_MORE_SOLS';
export const SHOW_LESS_SOLS = 'roverView/SHOW_LESS_SOLS';

export const SORT_SOLS = 'roverView/SORT_SOLS';

export const roverMatcher = roverToMatch =>
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

// https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?sol=1000&api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity?api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit?api_key=DEMO_KEY

const getStats = (data) => {
  const stats = { ...data };
  delete stats.name;
  delete stats.photos;
  return stats;
};

function roverView(state = initialState, action = {}) {
  switch (action.type) {
    case 'redux-pouchdb/SET_REDUCER':
      if (action.reducer === 'roverView') {
        if (action.state.error) {
          return {
            ...state,
            loaded: true,
            loading: false,
            fromError: true,
            error: false,
          };
        }
      }
      return {
        ...state,
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

export const getManifest = (_rover, offline) => {

  const rover = _rover || initialState.defaultRover;
  const types = [GET_MANIFEST, GET_MANIFEST_SUCCESS, GET_MANIFEST_FAIL];

  return getManifestFor({
    rover,
    types,
    offline,
  });
};

export const updateList = ({ sorts, filter, range } = {}) => {
  const type = SORT_SOLS;
  const stateKey = 'roverView';
  return _updateList({ type, stateKey, sorts, filter, range });
};

export default persistentReducer(roverView, 'roverView');
