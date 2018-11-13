import { debounce } from 'lodash';

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

const save = (db, localId) => {
  const saveReducer = (reducerName, reducerState) => {
    if (isSaving[reducerName]) {
      // enqueue promise
      unpersistedQueue[reducerName] = unpersistedQueue[reducerName] || [];
      unpersistedQueue[reducerName].push(reducerState);

      return Promise.resolve();
    }

    isSaving[reducerName] = true;

    return db
      .get(reducerName)
      .catch(err => {
        if (err.status === 404) {
          return { _id: reducerName };
        }
        throw err;
      })
      .catch(err => console.error('SAVE_ERROR:', err))
      .then(doc => {
        doc.localId = localId;
        doc.state = reducerState;
        return doc;
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

  const debouncedSaveReducer = debounce(saveReducer, 250, { leading: true });
  return debouncedSaveReducer;
};

export { save };
