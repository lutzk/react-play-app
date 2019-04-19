import produce from 'immer';
import { AnyAction, Reducer } from 'redux';
import {
  persistentReducer,
  POUCH_ACTION_TYPES,
} from '../../../redux-pouchdb-plus/src/index';
import { endLoading, startLoading } from './pageLoadBar';

import {
  _updateList,
  aaa,
  rovers,
  GenericIdentityFnA,
  getManifestFor,
  MarsRovers,
  sortList,
  spirit,
} from './shared/shared';
import { PromiseAction, Thunk } from '../store/types';

const reducerName = 'RoverView';

export enum ROVERVIEW_ACTION_TYPES {
  SORT_SOLS = 'roverView/SORT_SOLS',
  GET_MANIFEST = 'roverView/GET_MANIFEST',
  GET_MANIFEST_SUCCESS = 'roverView/GET_MANIFEST_SUCCESS',
  GET_MANIFEST_FAIL = 'roverView/GET_MANIFEST_FAIL',
}

export interface RoverViewState {
  rover: any;
  error: any;
  rovers: any;
  loaded: boolean;
  loading: boolean;
  roverName: string;
  listLength: number;
  list: any;
  listToRender: any;
  missionStats: any;
  maxShown: boolean;
  maxSol: number;
  defaultRover: string; // rovers[spirit.label];
  moreShown: boolean;
  sorts: any;
  filter: any;
  defaultSorts: any;
  range: any; // defaultRange,
  reducerName?: string;
  ready: boolean;
  prefetched: boolean;
  reinitializing: boolean;
  reinitRequested: boolean;
}

interface RoverResult {
  photoManifest: any;
}

export interface RoverViewAction extends PromiseAction {
  reducerName?: string;
  range?: any;
  sorts?: any;
  filter?: any;
  list?: any;
  result?: RoverResult;
  error?: any;
  type:
    | ROVERVIEW_ACTION_TYPES
    | POUCH_ACTION_TYPES.RESET
    | POUCH_ACTION_TYPES.REINIT
    | POUCH_ACTION_TYPES.REDUCER_READY;
}

const roverMatcher = (roverToMatch: MarsRovers) =>
  Object.values(MarsRovers).indexOf(roverToMatch) > -1;

const availableSorts = {
  fields: ['sol', 'totalPhotos', 'cameras'],
  orders: ['asc', 'desc'],
};
const defaultSorts = { fields: ['sol'], orders: ['asc', 'desc'] };
const defaultFilter = {
  fields: {
    sol: {
      value: 0,
      on: false,
    },
    totalPhotos: {
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

const initialState: RoverViewState = {
  rover: null,
  error: null,
  rovers,
  loaded: false,
  loading: false,
  roverName: null,
  listLength: 0,
  list: null,
  listToRender: null,
  missionStats: null,
  maxShown: false,
  maxSol: null,
  defaultRover: MarsRovers.spirit,
  moreShown: false,
  sorts: availableSorts,
  filter: defaultFilter,
  defaultSorts,
  range: defaultRange,
  ready: false,
  prefetched: false,
  reinitializing: false,
  reinitRequested: false,
};

const getStats = data => {
  const stats = { ...data };
  delete stats.name;
  delete stats.photos;
  return stats;
};

// any:
// [ts] Expected 1 arguments, but got 2. [2554]
const spread = produce(Object.assign) as any;
const roverView: Reducer<RoverViewState> = (
  state = initialState,
  action: RoverViewAction,
) =>
  produce(state, draft => {
    switch (action.type) {
      case POUCH_ACTION_TYPES.RESET:
        return initialState;

      case POUCH_ACTION_TYPES.REDUCER_READY:
        if (action.reducerName === reducerName) {
          draft.ready = true;
          draft.prefetched = false;
          draft.reinitializing = false;
          return;
        }
        return;

      case POUCH_ACTION_TYPES.REINIT:
        draft.ready = false;
        draft.reinitializing = true;
        draft.reinitRequested = false;
        return;

      case ROVERVIEW_ACTION_TYPES.SORT_SOLS:
        draft.range = spread(draft.range, action.range);
        draft.sorts = spread(draft.sorts, action.sorts);
        draft.filter = spread(draft.filter, action.filter);
        draft.listToRender = action.list.map(l => l);
        return;

      case ROVERVIEW_ACTION_TYPES.GET_MANIFEST:
        draft.loading = true;
        draft.loaded = false;
        return;

      case ROVERVIEW_ACTION_TYPES.GET_MANIFEST_SUCCESS:
        draft.rover = action.result.photoManifest.name.toLowerCase();
        draft.error = null;
        draft.loaded = true;
        draft.loading = false;
        draft.maxSol =
          action.result.photoManifest.photos[
            action.result.photoManifest.photos.length - 1
          ].sol;
        draft.roverName = action.result.photoManifest.name;
        draft.listLength = action.result.photoManifest.photos.length;
        draft.list = action.result.photoManifest.photos;
        draft.missionStats = getStats(action.result.photoManifest);
        draft.listToRender = sortList({
          list: action.result.photoManifest.photos,
          sorts: draft.sorts,
          filter: draft.filter,
          range: draft.range,
        });
        return;

      case ROVERVIEW_ACTION_TYPES.GET_MANIFEST_FAIL:
        draft.error = action.error;
        draft.loaded = false;
        draft.loading = false;
        return;
    }
  });

const getManifest = (roverName: MarsRovers, offline: boolean) => {
  const rover = roverName || initialState.defaultRover;
  const type = ROVERVIEW_ACTION_TYPES.GET_MANIFEST;
  const asyncTypes = [
    ROVERVIEW_ACTION_TYPES.GET_MANIFEST_SUCCESS,
    ROVERVIEW_ACTION_TYPES.GET_MANIFEST_FAIL,
  ];
  const getManifestForRoverView: GenericIdentityFnA<
    RoverViewAction
  > = getManifestFor;
  return getManifestForRoverView({
    rover,
    type,
    asyncTypes,
    offline,
  });
};

const updateList = ({ sorts, filter, range }: any = {}) => {
  const type = ROVERVIEW_ACTION_TYPES.SORT_SOLS;
  const stateKey = 'roverView';
  return _updateList({ type, stateKey, sorts, filter, range });
};

const initPage: Thunk<Promise<any>> = () => async (dispatch, getState) => {
  const {
    location: {
      payload: { rover },
    },
  } = getState();
  const NAME = reducerName;
  const roverViewState = getState().roverView;
  const getRover = () =>
    roverMatcher(rover.toLowerCase()) ? rover : roverViewState.defaultRover;
  if (roverViewState.loaded) {
    if (roverViewState.roverName !== getRover()) {
      return dispatch(getManifest(getRover(), false)).then(() => {
        dispatch(endLoading());
        return NAME;
      });
    }
    dispatch(endLoading());
    return NAME;
  }
  if (roverViewState.reinitializing || roverViewState.reinitRequested) {
    dispatch(startLoading());
    if (/* !getState().roverView.loaded || */ !getState().roverView.loading) {
      return dispatch(getManifest(getRover(), false)).then(() => {
        dispatch(endLoading());
        return NAME;
      });
    }
    dispatch(endLoading());
    return NAME;
  }
  return dispatch(getManifest(getRover(), false)).then(() => {
    dispatch(endLoading());
    return NAME;
  });
};

const roverViewReducer = persistentReducer<RoverViewState>(
  roverView,
  reducerName,
);

export {
  MarsRovers,
  initPage,
  updateList,
  getManifest,
  roverMatcher,
  roverViewReducer,
};
