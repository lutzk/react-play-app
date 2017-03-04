import {
  sortList,
  updateCount,
  getNewCount,
  getManifestFor,
  sortListAction,
} from './shared/shared';

export const GET_SOL_MANIFEST = 'sol/GET_SOL_MANIFEST';
export const GET_SOL_MANIFEST_SUCCESS = 'sol/GET_SOL_MANIFEST_SUCCESS';
export const GET_SOL_MANIFEST_FAIL = 'sol/GET_SOL_MANIFEST_FAIL';

export const SORT_SOL_PHOTOS = 'sol/SORT_SOL_PHOTOS';
export const UPDATE_SOL_PHOTOS_SHOW_COUNT = 'sol/UPDATE_SOL_PHOTOS_SHOW_COUNT';

const sortSettings = { fields: ['id', 'earth_date', 'camera', 'camera.id'], fieldsOrders: ['asc', 'desc'] };

const initialState = {
  sol: null,
  error: null,
  loaded: false,
  loading: false,
  count: 15,
  solPhotosLenght: 0,
  solPhotos: null,
  solPhotosToRender: null,
  maxShown: false,
  moreShown: false,
  initialCount: 15,
  sortSettings,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SORT_SOL_PHOTOS:
      return {
        ...state,
        solPhotosToRender: action.list,
        sortSettings: action.sortSettings,
      };

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
        solPhotosToRender: sortList({
          list: action.result.photos,
          count: state.count,
          sortSettings: state.sortSettings,
        }),
      };

    case GET_SOL_MANIFEST_FAIL:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
      };

    case UPDATE_SOL_PHOTOS_SHOW_COUNT:
      return {
        ...state,
        count: getNewCount(action.newCount, state.solPhotosLenght),
        maxShown: action.newCount >= state.solPhotosLenght,
        minShown: action.newCount <= 0,
        solPhotosToRender: sortList({
          list: state.solPhotos,
          count: state.count,
          newCount: getNewCount(action.newCount, state.solPhotosLenght),
          sortSettings: state.sortSettings,
        }),
        moreShown: true,
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

export const showMore = () => (dispatch, getState) => {

  const { count, initialCount } = getState().solView;
  const newValue = count + initialCount;

  return dispatch(updateCount(newValue, UPDATE_SOL_PHOTOS_SHOW_COUNT));
};

export const showLess = () => (dispatch, getState) => {

  const { count, initialCount } = getState().solView;
  const newValue = count - initialCount;

  return dispatch(updateCount(newValue, UPDATE_SOL_PHOTOS_SHOW_COUNT));
};

export const sort = _sortSettings =>
  (dispatch, getState) => {

    const { count, solPhotos } = getState().solView;
    const list = solPhotos;
    const type = SORT_SOL_PHOTOS;

    return dispatch(sortListAction({
      list,
      count,
      type,
      sortSettings: _sortSettings,
    }));
  };

