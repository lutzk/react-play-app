// import PouchDB from 'pouchdb';
import PouchDB from 'pouchdb-browser';
import DevTools from '../containers/DevTools/DevTools';
import { persistentStore } from '../../redux-pouchdb-plus/src/index';

const db = (state) => {
  if (state.user.user && state.user.user.userId) {
    return {
      local: new PouchDB(`_localUser_${state.user.user.userId}`, { revs_limit: 50, auto_compaction: true }),
      remote: new PouchDB(state.user.user.userDB),
    };
  }

  return false;
};

export {
  db,
  DevTools,
  persistentStore,
};
