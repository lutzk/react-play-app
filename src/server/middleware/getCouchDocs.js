const fetchDoc = async (db, docName) => {
  let doc = false;
  try {
    doc = await db.get(docName);
  } catch (e) {
    console.log(e);
  }
  return doc;
};

const fetchStatesFromCouch = (db) => {
  const statesKeysToFetch = ['roverView', 'solView'];
  const statesFromCouch = statesKeysToFetch.map(key =>
    fetchDoc(db, key).then(doc => ({
      name: doc._id,
      state: doc.state,
    })));

  return Promise.all(statesFromCouch);
};

export const getCouchDocs = (remoteCouch) => (req, res, next) => { // eslint-disable-line
  const preloadedState = {};
  return fetchStatesFromCouch(remoteCouch)
  .then((states) => {
    states.map(state =>
      preloadedState[state.name] = state.state);

    res.preloadedState = preloadedState;// eslint-disable-line
    return next();
  });
};
