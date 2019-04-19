import produce from 'immer';
import { Reducer } from 'redux';
import {
  persistentReducer,
  POUCH_ACTION_TYPES,
} from '../../../redux-pouchdb-plus/src/index';
import {
  _updateList,
  getManifestFor,
  MarsRovers,
  sortList,
} from './shared/shared';
import { PromiseAction } from '../store/types';

export enum SOLVIEW_ACTION_TYPES {
  GET_SOL_MANIFEST = 'sol/GET_SOL_MANIFEST',
  GET_SOL_MANIFEST_SUCCESS = 'sol/GET_SOL_MANIFEST_SUCCESS',
  GET_SOL_MANIFEST_FAIL = 'sol/GET_SOL_MANIFEST_FAIL',
  SORT_SOL_PHOTOS = 'sol/SORT_SOL_PHOTOS',
}

export interface SolViewState {
  sol: any;
  error: any;
  loaded: boolean;
  loading: boolean;
  listLength: number;
  list: any;
  listToRender: any;
  minShown: boolean;
  maxShown: boolean;
  moreShown: boolean;
  sorts: any;
  filter: any;
  defaultSorts: any;
  range: any; // defaultRange,
  reducerName?: string;
  initialCount: number;
  prefetched: boolean;
}

export interface SolResult {
  photos: any[];
}

export interface SolViewAction extends PromiseAction {
  reducerName?: string;
  range?: any;
  sorts?: any;
  filter?: any;
  list?: any;
  result?: SolResult;
  error?: any;
  reducer?: string;
  state?: any;
  asyncTypes?: SOLVIEW_ACTION_TYPES[];
  type:
    | SOLVIEW_ACTION_TYPES
    | POUCH_ACTION_TYPES.RESET
    | POUCH_ACTION_TYPES.SET_REDUCER
    | POUCH_ACTION_TYPES.INIT;
}

const availableSorts = {
  fields: ['id', 'earthDate', 'camera', 'camera.id'],
  orders: ['asc', 'desc'],
};
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

const initialState: SolViewState = {
  sol: null,
  error: null,
  loaded: false,
  loading: false,
  initialCount: 15,
  listLength: 0,
  list: null,
  listToRender: null,
  minShown: false,
  maxShown: false,
  moreShown: false,
  sorts: availableSorts,
  defaultSorts,
  filter: defaultFilter,
  range: defaultRange,
  prefetched: false,
};

const cleanUpData = data =>
  data.map(item => {
    const fieldsWhiteList = ['id', 'sol', 'camera', 'imgSrc', 'earthDate'];
    const returnObj = {};
    Object.keys(item).map(itemKey =>
      fieldsWhiteList.indexOf(itemKey) > -1
        ? (returnObj[itemKey] = item[itemKey])
        : false,
    );

    return returnObj;
  });

const solView: Reducer<SolViewState> = (
  state = initialState,
  action: SolViewAction,
) =>
  produce(state, draft => {
    switch (action.type) {
      case POUCH_ACTION_TYPES.RESET:
        draft = initialState;
        return;

      case POUCH_ACTION_TYPES.SET_REDUCER:
        if (action.reducer === reducerName) {
          if (action.state.prefetched) {
            draft.prefetched = false;
            return;
          }
        }
        return;

      case POUCH_ACTION_TYPES.INIT:
        if (action.state.solView.prefetched) {
          draft.prefetched = false;
          return;
        }
        return;

      case SOLVIEW_ACTION_TYPES.SORT_SOL_PHOTOS:
        draft.listToRender = action.list;
        draft.sorts = action.sorts;
        draft.filter = action.filter;
        draft.range = action.range;
        return;

      case SOLVIEW_ACTION_TYPES.GET_SOL_MANIFEST:
        draft.loading = true;
        draft.loaded = false;
        return;

      case SOLVIEW_ACTION_TYPES.GET_SOL_MANIFEST_SUCCESS:
        draft.error = null;
        draft.loaded = true;
        draft.loading = false;
        draft.list = cleanUpData(action.result.photos);
        draft.listLength = action.result.photos.length;
        draft.listToRender = sortList({
          list: cleanUpData(action.result.photos),
          sorts: draft.sorts,
          filter: draft.filter,
          range: draft.range,
        });
        return;

      case SOLVIEW_ACTION_TYPES.GET_SOL_MANIFEST_FAIL:
        draft.error = action.error;
        draft.loaded = false;
        draft.loading = false;
        return;
    }
  });

const getSolManifest = (rover: MarsRovers, sol: number, offline: boolean) => {
  const type = SOLVIEW_ACTION_TYPES.GET_SOL_MANIFEST;
  const asyncTypes = [
    SOLVIEW_ACTION_TYPES.GET_SOL_MANIFEST_SUCCESS,
    SOLVIEW_ACTION_TYPES.GET_SOL_MANIFEST_FAIL,
  ];

  return getManifestFor({ sol, rover, type, asyncTypes, offline });
};

const updateList = ({ sorts, filter, range }: any = {}) => {
  const type = SOLVIEW_ACTION_TYPES.SORT_SOL_PHOTOS;
  const stateKey = 'solView';
  return _updateList({ type, stateKey, sorts, filter, range });
};

const solViewReducer = persistentReducer(solView, reducerName);

export {
  updateList,
  getSolManifest,
  solViewReducer,
};
