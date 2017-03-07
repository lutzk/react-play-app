import _ from 'lodash'; // eslint-disable-line

export const apiKey = 'DEMO_KEY';
export const apiBasePath = 'https://api.nasa.gov/mars-photos/api/v1/';
export const apiManifestsPath = 'manifests/';
export const offlineManifestBasePath = 'http://localhost:3010/roverManifest';

export const spirit = { name: 'Spirit', label: 'spirit' };
export const curiosity = { name: 'Curiosity', label: 'curiosity' };
export const opportunity = { name: 'Opportunity', label: 'opportunity' };

export const rovers = {
  [spirit.label]: spirit.name,
  [curiosity.label]: curiosity.name,
  [opportunity.label]: opportunity.name,
};

export const filterByFieldValue = (list, field, value) => list.filter(item => _.get(item, field) === value);

export const filterList = ({ list, count, newCount } = {}) => {

  let _count = count;
  const listLength = list.length;

  if (newCount > -1) {
    _count = newCount > listLength ? listLength : newCount;
  }

  return list.filter((item, index) => index < _count);
};

export const sortList = ({ sorts, list, count, newCount } = {}) => {

  let sortedList = [];
  const { fields, orders } = sorts;

  sortedList = filterList({
    count,
    newCount,
    list: _.orderBy(list, fields, orders),
  });

  return sortedList;
};

export const sortListAction = ({ list, count, sorts, type, filter } = {}) =>
  dispatch =>
    dispatch({
      type,
      sorts,
      filter,
      list: sortList({
        list,
        count,
        sorts,
      }),
    });

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

export const getNewCount = (newCount, lenght) => {
  let _newCount = newCount > -1 ? newCount : 0;
  _newCount = _newCount > lenght ? lenght : _newCount;
  return _newCount;
};

export const updateCount = (newCount, type) => ({
  type,
  newCount: newCount > -1 ? newCount : 0,
});
