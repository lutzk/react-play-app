export const GET_MANIFEST = 'marsRovers/GET_MANIFEST';
export const GET_MANIFEST_SUCCESS = 'marsRovers/GET_MANIFEST_SUCCESS';
export const GET_MANIFEST_FAIL = 'marsRovers/GET_MANIFEST_FAIL';

const initialState = {
  data: null,
  error: null,
  loaded: false,
  loading: false,
  defaultRover: 'Spirit'
};

// https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?sol=1000&api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity?api_key=DEMO_KEY
// https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit?api_key=DEMO_KEY

// const getJsonPath = (rover = initialState.defaultRover) => `./${rover}.json`;

const apiBasePath = 'https://api.nasa.gov/mars-photos/api/v1/';
const offlineManifestBasePath = 'http://localhost:3010/roverManifest';
const apiManifestsPath = 'manifests/';
const apiKey = 'DEMO_KEY';

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
        loaded: true,
        loading: false,
        data: action.result
      };
    case GET_MANIFEST_FAIL:
      return {
        ...state,
        loaded: false,
        loading: false,
        error: action.error
      };
    default:
      return state;
  }
}

export function getManifest(rover, offLine = false) {
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
}

