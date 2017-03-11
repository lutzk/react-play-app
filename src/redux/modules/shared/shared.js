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

export const filterByFieldValue = (list, filter) => {
  const newList = [];
  list.map(listItem =>
    filter.map((filterItem) => {
      if (filterItem !== undefined && _.get(listItem, filterItem.field) === parseInt(filterItem.value, 10)) {
        newList.push(listItem);
      }
      return 0;
    }));

  return newList;
};

export const filterList = ({ list, count, newCount } = {}) => {

  let _count = count;
  const listLength = list.length;

  if (newCount > -1) {
    _count = newCount > listLength ? listLength : newCount;
  }

  return list.filter((item, index) => index < _count);
};

const formatFilters = filters =>
  Object.keys(filters).map((field) => { // eslint-disable-line
    if (filters[field].on) {
      return { field, value: filters[field].value };
    }
  });

const isFilterOn = (filter) => {
  console.log(filter);
  let on = filter.on;

  Object.keys(filter.fields).map((field) => {
    if (filter.fields[field].on) {
      on = true;
      return on;
    }
    return on;
  });
  return on;
};

export const updateFilter = (filter, currentFilter) => {

  const newFilter = { ...currentFilter };
  const filterKeys = Object.keys(filter);

  if (filter.on !== newFilter.on) {
    newFilter.on = filter.on;

  } else { // eslint-disable-line
    Object.keys(currentFilter.fields).map((key) => {
      const item = newFilter.fields[key];
      const filterKey = filterKeys[1];

      if (key === filterKey) {
        const _filter = filter[key];

        if (_filter.value || _filter.value === 0) {
          if (typeof _filter.value === 'number' && !isNaN(_filter.value) && _filter.value > -1) {
            item.value = _filter.value;
          } else if (typeof _filter.value === 'string') {
            item.value = _filter.value;
          }

        } else if (_filter.on !== undefined && _filter.on !== item.on) {
          item.on = _filter.on;
        }
      }

      return 0;
    });
  }

  return newFilter;
};

export const sortList = ({ sorts, list, count, newCount, filter } = {}) => {
  let sortedList = list;
  const { fields, orders } = sorts;

  if (filter && isFilterOn(filter)) {
    console.log(filter.fields);
    const filters = formatFilters(filter.fields);
    sortedList = filterByFieldValue(sortedList, filters);
  }

  sortedList = filterList({
    count,
    newCount,
    list: _.orderBy(sortedList, fields, orders),
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
        filter,
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
