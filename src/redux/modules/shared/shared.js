import _ from 'lodash'; // eslint-disable-line

export const apiKey = 'DEMO_KEY';
export const apiBasePath = 'https://api.nasa.gov/mars-photos/api/v1/';
export const apiManifestsPath = 'manifests/';
export const offlineManifestBasePath = 'http://localhost:3010/roverManifest';

export const filterList = ({ list, count, newCount } = {}) => {

  let _count = count;
  const listLength = list.length;

  if (newCount > -1) {
    _count = newCount > listLength ? listLength : newCount;
  }

  return list.filter((item, index) => index < _count);
};

export const sortList = ({ sortSettings, list, count, type } = {}) =>
  (dispatch) => {

    let sortedList = [];
    const { fields, fieldsOrders } = sortSettings;

    sortedList = filterList({
      count,
      list: _.orderBy(list, fields, fieldsOrders),
    });

    return dispatch({
      type,
      sortSettings,
      list: sortedList,
    });
  };

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

// export const getNewCount = (newCount, lenght) => {
//   let _newCount = newCount > -1 ? newCount : 0;
//   _newCount = _newCount > lenght ? lenght : _newCount;
//   return _newCount;
// };

export const updateCount = (newCount, type) => ({
  type,
  newCount: newCount > -1 ? newCount : 0,
});

export const increaseCount = ({ currentCount, add, type } = {}) => (dispatch) => {
  const newCount = currentCount + add;
  return dispatch(updateCount(newCount, type));
};

export const decreaseCount = ({ currentCount, subtract, type } = {}) => (dispatch) => {
  const newCount = currentCount - subtract;
  return dispatch(updateCount(newCount, type));
};
