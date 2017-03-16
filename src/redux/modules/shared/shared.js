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

export const filterList = ({ list, range } = {}) => {

  const maxListLength = list.length;
  let start = null;
  let end = null;

  if (range.start > -1) {
    start = range.start;
    end = range.end;
    end = end > maxListLength ? maxListLength : end;
  }

  if (range.start === 0 && range.end === 0) {
    return [];
  }

  return list.filter((item, index) => index >= start && index <= end);
};

const formatFilters = filters =>
  Object.keys(filters).map((field) => { // eslint-disable-line
    if (filters[field].on) {
      return { field, value: filters[field].value };
    }
  });

const isFilterOn = (filter) => {
  let on = false;
  const globalOn = filter.on;
  Object.keys(filter.fields).map((field) => { // eslint-disable-line
    if (filter.fields[field].on) {
      on = true;
      return on;// eslint-disable-line
    }

    return on;
  });
  return globalOn && on;
};

export const updateRange = (range, stateRange, listLength) => {
  const newRange = { ...stateRange };
  const rangeLength = newRange.end - newRange.start;

  if (range.on !== undefined && range.on !== newRange.on) {
    newRange.on = range.on;
  }

  if (range.action && range.action === 'next') {
    newRange.start += rangeLength;
    newRange.end += rangeLength;
    // newRange.start = newRange.start > listLength ? listLength : newRange.start;
    newRange.end = newRange.end > listLength ? listLength : newRange.end;
    newRange.start = newRange.end === listLength ?
      newRange.start - rangeLength : newRange.start;
  }

  if (range.action && range.action === 'prev') {
    newRange.start -= rangeLength;
    newRange.end -= rangeLength;
    // newRange.end = newRange.end < 0 ? 0 : newRange.end;
  }

  if (range.action && range.action === 'more') {
    newRange.end += newRange.initialCount;
    newRange.end = newRange.end > listLength ? listLength : newRange.end;
  }

  if (range.action && range.action === 'less') {
    newRange.end -= newRange.initialCount;
    newRange.end = newRange.end < 0 ? 0 : newRange.end;
  }

  return newRange;
};

export const updateFilter = (filter, currentFilter) => {

  const newFilter = { ...currentFilter };
  const filterKeys = Object.keys(filter);

  if (filter.on !== undefined && filter.on !== newFilter.on) {
    newFilter.on = filter.on;

  } else { // eslint-disable-line
    Object.keys(currentFilter.fields).map((key) => {
      const item = newFilter.fields[key];
      const filterKey = filterKeys[filterKeys.indexOf(key)];

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

export const sortList = ({ list, sorts, filter, range } = {}) => {
  let sortedList = list;
  const { fields, orders } = sorts;

  if (filter && isFilterOn(filter)) {
    const filters = formatFilters(filter.fields);
    sortedList = filterByFieldValue(sortedList, filters);
  }

  sortedList = filterList({
    range,
    list: _.orderBy(sortedList, fields, orders),
  });

  return sortedList;
};

export const sortListAction = ({ list, sorts, type, filter, range } = {}) =>
  dispatch =>
    dispatch({
      type,
      sorts,
      filter,
      range,
      list: sortList({
        list,
        sorts,
        filter,
        range,
      }),
    });

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

export const _updateList = ({ type: _type, stateKey, sorts, filter, range } = {}) =>
  (dispatch, getState) => {
    const {
      list: stateList,
      filter: stateFilter,
      sorts: stateSorts,
      range: stateRange,
    } = getState()[stateKey];

    const list = stateList;
    const listLength = list.length || 0;
    const type = _type;
    const newSorts = sorts || stateSorts;
    let newFilter = null;
    let newRange = null;

    if (filter) {
      newFilter = updateFilter(filter, stateFilter);

    } else {
      newFilter = stateFilter;
    }

    if (range) {
      newRange = updateRange(range, stateRange, listLength);
    } else {
      newRange = stateRange;
    }

    return dispatch(sortListAction({ list, type, sorts: newSorts, filter: newFilter, range: newRange }));
  };
