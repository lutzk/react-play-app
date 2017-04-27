import PouchDB from 'pouchdb';
import DevTools from '../containers/DevTools/DevTools';
import { persistentStore } from '../../redux-pouchdb-plus/src/index';

const db = (reducerName, store) => {
  const state = store.getState();
  if (state.user.user && state.user.user.userId) {
    return {
      local: new PouchDB(`_localUser_${state.user.user.userId}` /* , { revs_limit: 20 } */),
      remote: new PouchDB(state.user.user.userDB),
    };
  }

  return false;
};

export {
  db,
  PouchDB,
  DevTools,
  persistentStore,
};
