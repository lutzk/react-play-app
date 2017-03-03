export const apiKey = 'DEMO_KEY';
export const apiBasePath = 'https://api.nasa.gov/mars-photos/api/v1/';
export const apiManifestsPath = 'manifests/';
export const offlineManifestBasePath = 'http://localhost:3010/roverManifest';

export const getNewShowCount = (newCount, lenght) => {
  let _newCount = newCount > -1 ? newCount : 0;
  _newCount = _newCount > lenght ? lenght : _newCount;
  return _newCount;
};

// export const filterList = (list, state, newShowCount = undefined) => {

//   const { initialCount, listlength } = state[stateKey];
//   const _listLength = listLength || list.length;
//   let showCount = initialCount;

//   if (newShowCount > -1) {
//     showCount = newShowCount > _listLength ? _listLength : newShowCount;
//   }

//   return list.filter((item, index) => index < showCount);
// };

// const filterSolsRange = (sols, start = 0, end) =>
//   sols.filter((sol, index) => index >= start && index <= end);
export const getManifestFor = ({ rover, sol, types, offline } = {}) => {

  const manifestFor = { rover: (rover && !sol), sol: (rover && sol) };
  const getPath = () => {
    let path = '';

    if (manifestFor.rover) {
      path = offline ?
        `${offlineManifestBasePath}?rover=${rover}`
        : `${apiBasePath}${apiManifestsPath}${rover}?api_key=${apiKey}`;

    } else if (manifestFor.sol) {
      path = offline ?
        `${offlineManifestBasePath}?rover=${rover}&sol=${sol}`
        : `${apiBasePath}${rover}/${sol}/photos?${sol}&api_key=${apiKey}`;
    }

    return path;
  };

  const requestPath = getPath();
  const request = client => client.get(requestPath);

  return {
    types,
    promise: request,
  };
};

export const updateCountShown = (newCount, type) => ({
  type,
  newCount: newCount > -1 ? newCount : 0,
});

// showMore('solView', UPDATE_SOL_SHOW_COUNT)
export const showMore = (stateKey, type) => (dispatch, getState) => {
  const state = getState()[stateKey];
  const newCount = state.count + state.initialCount;
  return dispatch(updateCountShown(newCount, type));
};

export const showLess = (stateKey, type) => (dispatch, getState) => {
  const state = getState()[stateKey];
  const newCount = state.count - state.initialCount;
  return dispatch(updateCountShown(newCount, type));
};

// export const getSolsToRender = (options = solSortSettings) =>
// export const sortList = (options = sortSettings, stateKey, type) =>
//   (dispatch, getState) => {

//     const state = getState()[stateKey];
//     const { fields, fieldsOrders } = options;
//     const { count, __LIST__ } = state;
//     let list = [];

//     list = _.orderBy(__LIST__, fields, fieldsOrders);
//     list = filterList(list, state, count);

//     return dispatch({
//       sols,
//       type,
//       sortSettings: options,
//     });
//   };
