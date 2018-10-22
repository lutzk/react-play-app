import { AnyAction, Reducer } from 'redux';
import {
  SYNC,
  SYNC_SUCCESS /* , SYNC_FAIL */,
} from '../../../redux-pouchdb-plus/src/index';

interface AppState {
  data: any;
  pouchWorker: any;
  reducerName: string;
  sendMsgToWorker: any;
  syncing: boolean;
}

interface AppAction extends AnyAction {
  data: any;
  pouchWorker: any;
  reducerName: any;
  sendMsgToWorker: any;
}

const initialState: AppState = {
  data: null,
  pouchWorker: null,
  reducerName: null,
  sendMsgToWorker: null,
  syncing: false,
};

const app: Reducer<AppState> = (state = initialState, action: AppAction) => {
  switch (action.type) {
    case '@@redux-pouchdb-plus/INIT':
      return {
        pouchWorker: action.pouchWorker,
        sendMsgToWorker: action.sendMsgToWorker,
        ...state,
      };
    case SYNC:
      return {
        ...state,
        syncing: true,
        reducerName: action.reducerName,
      };

    case SYNC_SUCCESS:
      return {
        ...state,
        syncing: false,
        savedData: action.data,
        reducerName: action.reducerName,
      };
    default:
      return state;
  }
};

export { app, AppState, AppAction };
