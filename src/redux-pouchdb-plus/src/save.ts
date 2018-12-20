import { POUCH, DocModel } from '../../helpers/getUserDBS';

const unpersistedQueue = {};
const isSaving = {};

// checks if there is some state saving in progress
// export function inSync() {
//   const reducerNames = Object.keys(isSaving);
//   for (let n of reducerNames) {
//     if (isSaving[n])
//       return false;
//   }
//   return true;
// }

const isDocModel = (doc: DocModel): doc is DocModel =>
  'state' in doc || 'localId' in doc || '_id' in doc;

const save = (db: POUCH, localId: string) => {
  const saveReducer = (reducerName: string, reducerState) => {
    if (isSaving[reducerName]) {
      // enqueue promise
      unpersistedQueue[reducerName] = unpersistedQueue[reducerName] || [];
      unpersistedQueue[reducerName].push(reducerState);

      return Promise.resolve();
    }

    isSaving[reducerName] = true;
    // docId: "SolView"
    // error : true
    // message: "missing"
    // name: "not_found"
    // reason: "missing"
    // status: 404
    // __proto__: Error
    return db
      .get(reducerName, {
        revs: true,
        revs_info: true,
      })
      .catch(err => {
        if (err.status === 404) {
          console.log('__get_ERROR:', err);
          return { _id: reducerName };
        }
        throw err;
      })
      .catch(err => console.error('SAVE_ERROR:', err))
      .then((doc: any) => {
        // if (doc) {
        //   if (isDocModel(doc)) {
        doc.localId = localId;
        doc.state = reducerState;
        return doc;
        //   }
        //   db.put(doc);
        // }
      })
      .then(doc => db.put(doc))
      .then(() => {
        delete isSaving[reducerName];

        if (
          unpersistedQueue[reducerName] &&
          unpersistedQueue[reducerName].length > 0
        ) {
          const next = unpersistedQueue[reducerName].shift();
          return saveReducer(reducerName, next);
        }
      })
      .catch(err => console.error(err));
  };

  return saveReducer;
};

export { save };
