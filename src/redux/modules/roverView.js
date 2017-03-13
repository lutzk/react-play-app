import {
  rovers,
  spirit,
  sortList,
  updateRange,
  updateFilter,
  getManifestFor,
  sortListAction,
} from './shared/shared';

export const GET_MANIFEST = 'roverView/GET_MANIFEST';
export const GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS';
export const GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL';
export const SHOW_MORE_SOLS = 'roverView/SHOW_MORE_SOLS';
export const SHOW_LESS_SOLS = 'roverView/SHOW_LESS_SOLS';

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
  listLenght: 0,
  list: null,
  listToRender: null,
  missionStats: null,
  maxShown: false,
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

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
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

export const updateList = ({ sorts, filter, range } = {}) =>
  (dispatch, getState) => {
    const {
      list: stateList,
      filter: stateFilter,
      sorts: stateSorts,
      range: stateRange,
    } = getState().roverView;

    const list = stateList;
    const listLength = list.length || 0;
    const type = SORT_SOLS;
    const newSorts = sorts || stateSorts;
    let newFilter = null;
    let newRange = null;

    if (filter) {
      newFilter = updateFilter(filter, stateFilter);

    } else {
      newFilter = stateFilter;
    }

    if (range) {
      newRange = updateRange(range, stateRange, listLength);
    } else {
      newRange = stateRange;
    }

    return dispatch(sortListAction({ list, type, sorts: newSorts, filter: newFilter, range: newRange }));
  };
