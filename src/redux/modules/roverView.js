export const GET_MANIFEST = 'roverView/GET_MANIFEST';
export const GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS';
export const GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL';
export const UPDATE_CURRENT_SOL_SHOW_COUNT = 'roverView/UPDATE_CURRENT_SOL_SHOW_COUNT';
export const SHOW_MORE_SOLS = 'roverView/SHOW_MORE_SOLS';
export const SHOW_LESS_SOLS = 'roverView/SHOW_LESS_SOLS';

const initialState = {
  error: null,
  loaded: false,
  loading: false,
  solsCount: 15,
  roverName: null,
  solsLenght: 0,
  missionSols: null,
  missionStats: null,
  moreSolsShown: false,
  maxSolsShown: false,
  defaultRover: 'Spirit',
  initialSolCount: 15,
  solsToRender: null,
};

// https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?sol=1000&api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity?api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit?api_key=DEMO_KEY

// const getJsonPath = (rover = initialState.defaultRover) => `./${rover}.json`;

const apiBasePath = 'https://api.nasa.gov/mars-photos/api/v1/';
const offlineManifestBasePath = 'http://localhost:3010/roverManifest';
const apiManifestsPath = 'manifests/';
const apiKey = 'DEMO_KEY';

const getStats = (data) => {
  const stats = { ...data };
  delete stats.name;
  delete stats.photos;
  return stats;
};

const getNewSolShowCount = (newCount, solsLenght) => {
  let _newCount = newCount > -1 ? newCount : 0;
  _newCount = _newCount > solsLenght ? solsLenght : _newCount;
  return _newCount;
};

const filterSols = (sols, state, newSolShowCount = undefined) => {

  const { initialSolCount, solsLength } = state;
  const _solsLength = solsLength || sols.length;
  let solShowCount = initialSolCount;

  if (newSolShowCount > -1) {
    solShowCount = newSolShowCount > _solsLength ? _solsLength : newSolShowCount;
  }

  return sols.filter((sol, index) => index < solShowCount);
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case GET_MANIFEST:
      return {
        ...state,
        loading: true
      };

    case GET_MANIFEST_SUCCESS:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        roverName: action.result.photo_manifest.name,
        solsLenght: action.result.photo_manifest.photos.length,
        missionSols: action.result.photo_manifest.photos,
        missionStats: getStats(action.result.photo_manifest),
        solsToRender: filterSols(action.result.photo_manifest.photos, state)
      };

    case GET_MANIFEST_FAIL:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false
      };

    case UPDATE_CURRENT_SOL_SHOW_COUNT:// eslint-disable-line
      const newSolShowCount = getNewSolShowCount(action.newCount, state.solsLenght);
      return {
        ...state,
        solsCount: newSolShowCount,
        maxSolsShown: action.newCount >= state.solsLenght,
        minSolsShown: action.newCount <= 0,
        solsToRender: filterSols(state.missionSols, state, newSolShowCount),
        moreSolsShown: true
      };

    default:
      return state;
  }
}

export const getManifest = (rover, offLine = false) => {

  const _rover = rover || initialState.defaultRover;

  if (offLine) {
    return {
      types: [GET_MANIFEST, GET_MANIFEST_SUCCESS, GET_MANIFEST_FAIL],
      promise: client => client.get(`${offlineManifestBasePath}?rover=${_rover}`)
    };
  }

  return {
    types: [GET_MANIFEST, GET_MANIFEST_SUCCESS, GET_MANIFEST_FAIL],
    promise: client => client.get(`${apiBasePath}${apiManifestsPath}${_rover}?api_key=${apiKey}`)
  };
};

export const updateSolsShown = (newCount) => {
  return {
    type: UPDATE_CURRENT_SOL_SHOW_COUNT,
    newCount: newCount > -1 ? newCount : 0
  };
};

export const showMoreSols = () => {
  return (dispatch, getState) => {
    const roverState = getState().marsRovers;
    const newValue = roverState.solsCount + roverState.initialSolCount;
    return dispatch(updateSolsShown(newValue));
  };
};

export const showLessSols = () => {
  return (dispatch, getState) => {
    const roverState = getState().marsRovers;
    const newValue = roverState.solsCount - roverState.initialSolCount;
    return dispatch(updateSolsShown(newValue));
  };
};
