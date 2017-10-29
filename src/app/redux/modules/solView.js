import { persistentReducer } from '../../../redux-pouchdb-plus/src/index';
import {
  sortList,
  _updateList,
  getManifestFor,
} from './shared/shared';

const GET_SOL_MANIFEST = 'sol/GET_SOL_MANIFEST';
const GET_SOL_MANIFEST_SUCCESS = 'sol/GET_SOL_MANIFEST_SUCCESS';
const GET_SOL_MANIFEST_FAIL = 'sol/GET_SOL_MANIFEST_FAIL';

const SORT_SOL_PHOTOS = 'sol/SORT_SOL_PHOTOS';
// const UPDATE_SOL_PHOTOS_SHOW_COUNT = 'sol/UPDATE_SOL_PHOTOS_SHOW_COUNT';

const availableSorts = { fields: ['id', 'earthDate', 'camera', 'camera.id'], orders: ['asc', 'desc'] };
const defaultSorts = { fields: ['id'], orders: ['asc', 'desc'] };

const reducerName = 'SolView';

const defaultFilter = {
  fields: {
    id: {
      value: 0,
      on: false,
    },
    earthDate: {
      value: 0,
      on: false,
    },
    cameras: {
      value: '',
      on: false,
    },
    'camera.id': {
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
  sol: null,
  error: null,
  loaded: false,
  loading: false,
  initialCount: 15,
  listLength: 0,
  list: null,
  listToRender: null,
  maxShown: false,
  moreShown: false,
  sorts: availableSorts,
  filter: defaultFilter,
  defaultSorts,
  range: defaultRange,
};

const cleanUpData = data =>
  data.map((item) => {
    const fieldsWhiteList = ['id', 'sol', 'camera', 'imgSrc', 'earthDate'];
    const returnObj = {};
    Object.keys(item).map(itemKey =>
      fieldsWhiteList.indexOf(itemKey) > -1 ?
        returnObj[itemKey] = item[itemKey]
        : false);

    return returnObj;
  });

function solView(state = initialState, action = {}) {
  switch (action.type) {

    case '@@redux-pouchdb-plus/RESET':
      return {
        ...initialState,
      };

    case '@@redux-pouchdb-plus/SET_REDUCER':
      if (action.reducer === reducerName) {
        if (action.state.prefetched) {
          return {
            ...state,
            prefetched: false,
          };
        }
      }
      return {
        ...state,
      };

    case '@@redux-pouchdb-plus/INIT':
      if (action.state.solView.prefetched) {
        return {
          ...state,
          prefetched: false,
        };
      }
      return {
        ...state,
      };

    case SORT_SOL_PHOTOS:
      return {
        ...state,
        listToRender: action.list,
        sorts: action.sorts,
        filter: action.filter,
        range: action.range,
      };

    case GET_SOL_MANIFEST:
      return {
        ...state,
        loading: true,
        loaded: false,
      };

    case GET_SOL_MANIFEST_SUCCESS:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        list: cleanUpData(action.result.photos),
        listLength: action.result.photos.length,
        listToRender: sortList({
          list: cleanUpData(action.result.photos),
          sorts: state.sorts,
          filter: state.filter,
          range: state.range,
        }),
      };

    case GET_SOL_MANIFEST_FAIL:
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

const getSolManifest = (rover, sol, offline) => {
  const types = [GET_SOL_MANIFEST, GET_SOL_MANIFEST_SUCCESS, GET_SOL_MANIFEST_FAIL];

  return getManifestFor({ sol, rover, types, offline });
};

const updateList = ({ sorts, filter, range } = {}) => {
  const type = SORT_SOL_PHOTOS;
  const stateKey = 'solView';
  return _updateList({ type, stateKey, sorts, filter, range });
};

const solViewReducer = persistentReducer(solView, reducerName);

export {
  updateList,
  getSolManifest,
  solViewReducer,
};
