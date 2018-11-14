import produce from 'immer';
import { AnyAction, Reducer } from 'redux';
import {
  SYNC,
  SYNC_SUCCESS /* , SYNC_FAIL */,
} from '../../../redux-pouchdb-plus/src/index';

interface AppState {
  data?: any;
  savedData?: any;
  pouchWorker?: any;
  reducerName?: string;
  sendMsgToWorker?: any;
  syncing?: boolean;
}

interface AppAction extends AnyAction {
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
      case '@@redux-pouchdb-plus/INIT':
        draft.pouchWorker = action.pouchWorker;
        draft.sendMsgToWorker = action.sendMsgToWorker;
        return;

      case SYNC:
        draft.syncing = true;
        draft.reducerName = action.reducerName;
        return;

      case SYNC_SUCCESS:
        draft.syncing = false;
        // ?
        draft.data = action.data;
        draft.savedData = action.data;
        draft.reducerName = action.reducerName;
        return;
    }
  });

export { app, AppState, AppAction };
