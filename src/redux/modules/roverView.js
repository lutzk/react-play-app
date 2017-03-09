import {
  rovers,
  spirit,
  sortList,
  updateCount,
  getNewCount,
  getManifestFor,
  sortListAction,
  filterByFieldValue,
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
      value: 0,
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

export const updateFilter = filter => (dispatch, getState) => {
  const currentFilter = getState().roverView.filter;
  const newFilter = { ...currentFilter };
  const filterKeys = Object.keys(filter);

  if (filter.on !== newFilter.on) {
    newFilter.on = filter.on;

  } else { // eslint-disable-line
    Object.keys(currentFilter.fields).map((key) => {
      const item = newFilter.fields[key];
      const filterKey = filterKeys[1];

      if (key === filterKey) {
        const _filter = filter[key];

        if (_filter.value) {
          item.value = _filter.value;

        } else if (_filter.on !== item.on) {
          item.on = _filter.on;
        }
      }

      return 0;
    });
  }

  return dispatch({
    type: CHANGE_FILTER_VALUE,
    filter: newFilter,
  });
};

export const updateList = ({ sorts, filter } = {}) => (dispatch, getState) => {

  const { count, list: stateList, filter: stateFilter, sorts: stateSorts } = getState().roverView;

  let list = stateList;
  const type = SORT_SOLS;
  const _filter = filter || stateFilter;
  const _sorts = sorts || stateSorts;

  if (_filter && _filter.field && _filter.value) {
    list = filterByFieldValue(list, _filter.field, _filter.value);
  }

  return dispatch(sortListAction({ list, type, count, sorts: _sorts, filter: _filter }));
};
