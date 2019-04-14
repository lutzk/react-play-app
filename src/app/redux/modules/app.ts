import produce from 'immer';
import { Reducer } from 'redux';
import {
  POUCH_ACTION_TYPES,
  PouchAction,
  SendMsgToWorker,
} from '../../../redux-pouchdb-plus/src/index';
import { POUCH_WORKER_TYPES } from '../../../workers/pouchWorkerTypes';
import { PromiseAction, Thunk } from '../store/types';

interface AppState {
  data?: any;
  savedData?: any;
  pouchWorker?: Worker;
  reducerName?: string;
  sendMsgToWorker?: SendMsgToWorker;
  syncing?: boolean;
}

type AppActionTypes =
  | POUCH_ACTION_TYPES.INIT
  | POUCH_ACTION_TYPES.SYNC
  | POUCH_ACTION_TYPES.SYNC_SUCCESS
  | POUCH_ACTION_TYPES.REINIT_REDUCERS;

interface AppAction extends PromiseAction {
  type: AppActionTypes;
  data?: any;
  savedData?: any;
  pouchWorker?: any;
  reducerName?: any;
  sendMsgToWorker?: any;
}

const initialState: AppState = {
  syncing: false,
};

const app: Reducer<AppState> = (state = initialState, action: AppAction) =>
  produce(state, draft => {
    switch (action.type) {
      case POUCH_ACTION_TYPES.INIT:
        draft.pouchWorker = action.pouchWorker;
        draft.sendMsgToWorker = action.sendMsgToWorker;
        return;

      case POUCH_ACTION_TYPES.SYNC:
        draft.syncing = true;
        draft.reducerName = action.reducerName;
        return;

      case POUCH_ACTION_TYPES.SYNC_SUCCESS:
        draft.syncing = false;
        // ?
        draft.data = action.data;
        draft.savedData = action.data;
        draft.reducerName = action.reducerName;
        return;
    }
  });

const pouchAction = ({ type, asyncTypes, pouchPromise }): PouchAction => ({
  type,
  asyncTypes,
  pouchPromise,
});

const reinitReducers: Thunk<Promise<PouchAction>> = () => async (
  dispatch,
  getState,
) => {
  const {
    app: { sendMsgToWorker: sendMsg },
  } = getState();
  const msg = { type: POUCH_WORKER_TYPES.REINIT_REDUCERS };
  const type = POUCH_ACTION_TYPES.REINIT_REDUCERS;
  const asyncTypes = [
    POUCH_ACTION_TYPES.REINIT_SUCCESS,
    POUCH_ACTION_TYPES.REINIT_FAIL,
  ];
  const pouchPromise = () => sendMsg(msg);
  return dispatch(
    pouchAction({
      type,
      asyncTypes,
      pouchPromise,
    }),
  );
};

const syncInitial: Thunk<Promise<PouchAction>> = () => async (
  dispatch,
  getState,
) => {
  const {
    user,
    app: { sendMsgToWorker: sendMsg },
  } = getState();
  const msg = { user, type: POUCH_WORKER_TYPES.SYNC_INITIAL };
  const type = POUCH_ACTION_TYPES.SYNC_INITIAL;
  const asyncTypes = [
    POUCH_ACTION_TYPES.SYNC_INITIAL_SUCCESS,
    POUCH_ACTION_TYPES.SYNC_INITIAL_FAIL,
  ];
  const pouchPromise = _ => sendMsg(msg);
  return dispatch(pouchAction({ type, asyncTypes, pouchPromise }));
};

export {
  app,
  AppState,
  AppAction,
  syncInitial,
  AppActionTypes,
  reinitReducers,
};
