import { SYNC, SYNC_SUCCESS, SYNC_FAIL } from '../../../redux-pouchdb-plus/src/index';

const initialState = {};

export function app(state = initialState, action = {}) {
  switch (action.type) {
    case SYNC:
      console.log('___SYNC_ACTION___', action);
      return {
        ...state,
        syncing: true,
        reducerName: action.reducerName,
      };

    case SYNC_SUCCESS:
      console.log('___SYNC_ACTION__2_', action);
      return {
        ...state,
        syncing: false,
        savedData: action.data,
        reducerName: action.reducerName,
      };
    default:
      return state;
  }
}
