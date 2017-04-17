import PouchDB from 'pouchdb';
import { asyncWrap as wrap } from '../utils/utils';

const fetchDoc = async (db, docName) => {

  let doc = false;
  try {
    doc = await db.get(docName);
  } catch (e) {
    console.error(`error fetching document: ${docName} from: ${db.name}`, e);
  }

  return doc;
};

const fetchStatesFromCouch = (db) => {

  const statesKeysToFetch = ['roverView', 'solView'];
  const statesFromCouch = statesKeysToFetch.map(key =>
    fetchDoc(db, key).then((doc) => {
      if (doc._id) {
        return {
          name: doc._id,
          state: doc.state,
        };
      }
      return false;
    })
  );
  return Promise.all(statesFromCouch);
};

const getUserCouch = db =>
  Promise.resolve(
    new PouchDB(db, { skip_setup: true }));

export const getCouchDocs = () => wrap(async (req, res, next) => { // eslint-disable-line
  // console.log('getting couch docs bro ...');
  const couch = await getUserCouch(req.session.user.userDBs.supertest);

  if (!couch) {
    return next();
  }

  const preloadedState = {};
  const states = await fetchStatesFromCouch(couch);

  states
    .filter(state =>
      (state && state !== 'undefined' && typeof state === 'object'))
    .map(state =>
      preloadedState[state.name] = state.state);

  return res.status(200).json(preloadedState);
});
