import PouchDB from 'pouchdb'; // eslint-disable-line
import { asyncWrap as wrap } from '../utils/utils';
import { slCouchPath, couchDBProxyPath } from '../config';

const fetchDoc = async (db, docName) => {

  let doc = false;
  try {
    doc = await db.get(docName);
  } catch (e) {
    console.error(`error fetching document: ${docName} from: ${db.name}`, e);
  }

  return doc;
};

const fetchDocsFromCouch = (couch) => {

  const docsToFetch = ['RoverView', 'SolView'];
  const docs = docsToFetch.map(docKey =>
    fetchDoc(couch, docKey).then((doc) => {
      if (doc._id) {
        return {
          name: doc._id,
          state: doc.state,
        };
      }
      return false;
    })
  );
  return Promise.all(docs);
};

const getUserCouch = db =>
  Promise.resolve(
    new PouchDB(db, { skip_setup: true }));

const getCouchDocs = () => wrap(async (req, res, next) => {

  if (!req.session.user) {
    return next();
  }

  const couch = await getUserCouch(req.session.user.userDB.replace(couchDBProxyPath, slCouchPath));

  if (!couch) {
    throw next;
  }

  const preloadedState = {};
  const docs = await fetchDocsFromCouch(couch);

  docs
    .filter(doc =>
      (doc && doc !== 'undefined' && typeof doc === 'object'))
    .map(doc =>
      preloadedState[doc.name] = doc.state);

  return res.status(200).json(preloadedState);
});

export { getCouchDocs };
