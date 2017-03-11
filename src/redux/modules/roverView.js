import {
  rovers,
  spirit,
  sortList,
  updateCount,
  updateFilter,
  getNewCount,
  getManifestFor,
  sortListAction,
  // filterByFieldValue,
} from './shared/shared';

export const GET_MANIFEST = 'roverView/GET_MANIFEST';
export const GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS';
export const GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL';
export const UPDATE_CURRENT_SOL_SHOW_COUNT = 'roverView/UPDATE_CURRENT_SOL_SHOW_COUNT';
export const SHOW_MORE_SOLS = 'roverView/SHOW_MORE_SOLS';
export const SHOW_LESS_SOLS = 'roverView/SHOW_LESS_SOLS';

export const CHANGE_FILTER_VALUE = 'roverView/CHANGE_FILTER_VALUE';

export const SORT_SOLS = 'roverView/SORT_SOLS';

export const roverMatcher = roverToMatch =>
  Object.keys(rovers).indexOf(roverToMatch) > -1;

const availableSorts = { fields: ['sol', 'total_photos', 'cameras'], orders: ['asc', 'desc'] };
const defaultSorts = { fields: ['sol'], orders: ['asc', 'desc'] };
const defaultFilter = {
  fields: {
    sol: {
      value: 0,
      on: false,
    },
    total_photos: {
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

const initialState = {
  rover: null,
  error: null,
  rovers,
  loaded: false,
  loading: false,
  count: 15,
  roverName: null,
  listLenght: 0,
  list: null,
  listToRender: null,
  missionStats: null,
  maxShown: false,
  defaultRover: rovers[spirit.label],
  moreShown: false,
  initialCount: 15,
  sorts: availableSorts,
  filter: defaultFilter,
  defaultSorts,
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

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SORT_SOLS:
      return {
        ...state,
        listToRender: action.list,
        sorts: action.sorts,
        filter: action.filter,
      };

    case CHANGE_FILTER_VALUE:
      return {
        ...state,
        filter: action.filter,
        listToRender: sortList({
          list: state.list,
          count: state.solsCount,
          newCount: getNewCount(action.newCount, state.listLenght),
          sorts: state.sorts,
          filter: state.filter,
        }),
      };

    case GET_MANIFEST:
      return {
        ...state,
        loading: true,
      };

    case GET_MANIFEST_SUCCESS:
      return {
        ...state,
        rover: action.result.photo_manifest.name.toLowerCase(),
        error: null,
        loaded: true,
        loading: false,
        roverName: action.result.photo_manifest.name,
        listLenght: action.result.photo_manifest.photos.length,
        list: action.result.photo_manifest.photos,
        missionStats: getStats(action.result.photo_manifest),
        listToRender: sortList({
          list: action.result.photo_manifest.photos,
          count: state.count,
          sorts: state.sorts,
          filter: state.filter,
        }),
      };

    case GET_MANIFEST_FAIL:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
      };

    case UPDATE_CURRENT_SOL_SHOW_COUNT:
      return {
        ...state,
        count: getNewCount(action.newCount, state.listLenght),
        maxShown: action.newCount >= state.listLenght,
        minShown: action.newCount <= 0,
        listToRender: sortList({
          list: state.list,
          count: state.solsCount,
          newCount: getNewCount(action.newCount, state.listLenght),
          sorts: state.sorts,
          filter: state.filter,
        }),
        moreShown: true,
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

export const showMore = () => (dispatch, getState) => {

  const { count, initialCount } = getState().roverView;
  const newValue = count + initialCount;

  return dispatch(updateCount(newValue, UPDATE_CURRENT_SOL_SHOW_COUNT));
};

export const showLess = () => (dispatch, getState) => {

  const { count, initialCount } = getState().roverView;
  const newValue = count - initialCount;

  return dispatch(updateCount(newValue, UPDATE_CURRENT_SOL_SHOW_COUNT));
};

export const updateList = ({ sorts, filter } = {}) => (dispatch, getState) => {

  const { count, list: stateList, filter: stateFilter, sorts: stateSorts } = getState().roverView;

  const list = stateList;
  const type = SORT_SOLS;
  const _sorts = sorts || stateSorts;
  let newFilter = null;

  if (filter) {
    newFilter = updateFilter(filter, stateFilter);
  } else {
    newFilter = { ...stateFilter };
  }

  return dispatch(sortListAction({ list, type, count, sorts: _sorts, filter: newFilter }));
};
