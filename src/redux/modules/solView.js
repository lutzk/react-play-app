import _ from 'lodash'; // eslint-disable-line
import {
  sortList,
  updateCount,
  getNewCount,
  getManifestFor,
  sortListAction,
  filterByFieldValue,
} from './shared/shared';

export const GET_SOL_MANIFEST = 'sol/GET_SOL_MANIFEST';
export const GET_SOL_MANIFEST_SUCCESS = 'sol/GET_SOL_MANIFEST_SUCCESS';
export const GET_SOL_MANIFEST_FAIL = 'sol/GET_SOL_MANIFEST_FAIL';

export const SORT_SOL_PHOTOS = 'sol/SORT_SOL_PHOTOS';
export const UPDATE_SOL_PHOTOS_SHOW_COUNT = 'sol/UPDATE_SOL_PHOTOS_SHOW_COUNT';

const availableSorts = { fields: ['id', 'earth_date', 'camera', 'camera.id'], orders: ['asc', 'desc'] };
const defaultSorts = { fields: ['id'], orders: ['asc', 'desc'] };
const defaultFilter = { field: null, value: null, off: true };

const initialState = {
  sol: null,
  error: null,
  loaded: false,
  loading: false,
  count: 15,
  listLength: 0,
  list: null,
  listToRender: null,
  maxShown: false,
  moreShown: false,
  initialCount: 15,
  sorts: availableSorts,
  filter: defaultFilter,
  defaultSorts,
};

const cleanUpData = data =>
  data.map((item) => {
    const fieldsWhiteList = ['id', 'sol', 'camera', 'img_src', 'earth_date'];
    const returnObj = {};
    Object.keys(item).map(itemKey =>
      fieldsWhiteList.indexOf(itemKey) > -1 ?
        returnObj[itemKey] = item[itemKey]
        : false);

    return returnObj;
  });

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SORT_SOL_PHOTOS:
      return {
        ...state,
        sorts: action.sorts,
        filter: action.filter,
        listToRender: action.list,
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
        list: cleanUpData(action.result.photos),
        listLength: action.result.photos.length,
        listToRender: sortList({
          list: cleanUpData(action.result.photos),
          count: state.count,
          sorts: state.sorts,
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
        count: getNewCount(action.newCount, state.listLength),
        maxShown: action.newCount >= state.listLength,
        minShown: action.newCount <= 0,
        listToRender: sortList({
          list: state.list,
          count: state.count,
          newCount: getNewCount(action.newCount, state.listLength),
          sorts: state.sorts,
        }),
        moreShown: true,
      };

    default:
      return state;
  }
}


export const getSolManifest = (rover, sol, offline) => {
  const types = [GET_SOL_MANIFEST, GET_SOL_MANIFEST_SUCCESS, GET_SOL_MANIFEST_FAIL];

  return getManifestFor({ sol, rover, types, offline });
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

// const setFilter = ({ field, value, off }) => ({ field, value, off: false });
// const resetFilter = () => (defaultFilter);
export const updateList = ({ sorts, filter } = {}) => (dispatch, getState) => {

  const { count, list: stateList, filter: stateFilter, sorts: stateSorts } = getState().solView;

  let list = stateList;
  const type = SORT_SOL_PHOTOS;
  const _filter = filter || stateFilter;
  const _sorts = sorts || stateSorts;

  if (_filter && _filter.field && _filter.value) {
    list = filterByFieldValue(list, _filter.field, _filter.value);
  }

  return dispatch(sortListAction({ list, type, count, sorts: _sorts, filter: _filter }));
};

