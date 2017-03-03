import { getManifestFor } from './shared/shared';

export const GET_SOL_MANIFEST = 'sol/GET_SOL_MANIFEST';
export const GET_SOL_MANIFEST_SUCCESS = 'sol/GET_SOL_MANIFEST_SUCCESS';
export const GET_SOL_MANIFEST_FAIL = 'sol/GET_SOL_MANIFEST_FAIL';

const initialState = {
  rover: null,
  error: null,
  // rovers,
  loaded: false,
  loading: false,
  solPhotosCount: 15,
  roverName: null,
  solPhotosLenght: 0,
  solPhotos: null,
  solPhotosToRender: null,
  maxPhotosShown: false,
  // defaultRover: rovers[spirit.label],
  moreSolsShown: false,
  initialSolCount: 15,
  // photosSortSettings,
};

// const apiKey = 'DEMO_KEY';
// const apiBasePath = 'https://api.nasa.gov/mars-photos/api/v1/';
// const offlineManifestBasePath = 'http://localhost:3010/roverManifest';

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
    case GET_SOL_MANIFEST:
      return {
        ...state,
        loading: true,
      };

    case GET_SOL_MANIFEST_SUCCESS:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        solPhotos: action.result.photos,
        solPhotosLenght: action.result.photos.length,
        solPhotosToRender: filterSols(action.result.photos, state),
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


export const getSolManifest = (rover, sol, offline) => {
  const types = [GET_SOL_MANIFEST, GET_SOL_MANIFEST_SUCCESS, GET_SOL_MANIFEST_FAIL];
  return getManifestFor({
    sol,
    rover,
    types,
    offline,
  });
};
