import {
  rovers,
  spirit,
  sortList,
  updateCount,
  getNewCount,
  getManifestFor,
  sortListAction,
} from './shared/shared';

export const GET_MANIFEST = 'roverView/GET_MANIFEST';
export const GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS';
export const GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL';
export const UPDATE_CURRENT_SOL_SHOW_COUNT = 'roverView/UPDATE_CURRENT_SOL_SHOW_COUNT';
export const SHOW_MORE_SOLS = 'roverView/SHOW_MORE_SOLS';
export const SHOW_LESS_SOLS = 'roverView/SHOW_LESS_SOLS';

export const SORT_SOLS = 'roverView/SORT_SOLS';

export const roverMatcher = roverToMatch =>
  Object.keys(rovers).indexOf(roverToMatch) > -1;

const solSortSettings = { fields: ['sol', 'total_photos'], fieldsOrders: ['asc', 'desc'] };

// const defaultSolSortSettings = [
//   ['sol', 'asc'],
//   ['total_photos', 'asc'],
//   ['cameras', 'asc'],
// ];

const initialState = {
  rover: null,
  error: null,
  rovers,
  loaded: false,
  loading: false,
  solsCount: 15,
  roverName: null,
  solsLenght: 0,
  missionSols: null,
  solsToRender: null,
  missionStats: null,
  maxSolsShown: false,
  defaultRover: rovers[spirit.label],
  moreSolsShown: false,
  initialSolCount: 15,
  solSortSettings,
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
        solsToRender: action.list,
        solSortSettings: action.sortSettings,
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
        solsLenght: action.result.photo_manifest.photos.length,
        missionSols: action.result.photo_manifest.photos,
        missionStats: getStats(action.result.photo_manifest),
        solsToRender: sortList({
          list: action.result.photo_manifest.photos,
          count: state.solsCount,
          sortSettings: state.solSortSettings,
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
        solsCount: getNewCount(action.newCount, state.solsLenght),
        maxSolsShown: action.newCount >= state.solsLenght,
        minSolsShown: action.newCount <= 0,
        solsToRender: sortList({
          list: state.missionSols,
          count: state.solsCount,
          newCount: getNewCount(action.newCount, state.solsLenght),
          sortSettings: state.solSortSettings,
        }),
        moreSolsShown: true,
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

export const showMoreSols = () => (dispatch, getState) => {

  const roverState = getState().roverView;
  const newValue = roverState.solsCount + roverState.initialSolCount;

  return dispatch(updateCount(newValue, UPDATE_CURRENT_SOL_SHOW_COUNT));
};

export const showLessSols = () => (dispatch, getState) => {

  const roverState = getState().roverView;
  const newValue = roverState.solsCount - roverState.initialSolCount;

  return dispatch(updateCount(newValue, UPDATE_CURRENT_SOL_SHOW_COUNT));
};

export const sortSols = (sortSettings = solSortSettings) =>
  (dispatch, getState) => {

    const { solsCount, missionSols } = getState().roverView;
    const list = missionSols;
    const type = SORT_SOLS;
    const count = solsCount;

    return dispatch(sortListAction({
      list,
      count,
      type,
      sortSettings,
    }));
  };
