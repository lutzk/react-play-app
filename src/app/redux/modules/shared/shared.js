import _ from 'lodash'; // eslint-disable-line

const spirit = { name: 'Spirit', label: 'spirit' };
const curiosity = { name: 'Curiosity', label: 'curiosity' };
const opportunity = { name: 'Opportunity', label: 'opportunity' };

const rovers = {
  [spirit.label]: spirit.name,
  [curiosity.label]: curiosity.name,
  [opportunity.label]: opportunity.name,
};

const filterByFieldValue = (list, filter) => {
  const newList = [];
  list.map(listItem => { // eslint-disable-line
    const combinedFilterMatrix = [];
    filter.map((filterItem) => { // eslint-disable-line
      if (filterItem !== undefined) {
        if (_.get(listItem, filterItem.field) === parseInt(filterItem.value, 10)) {
          return combinedFilterMatrix.push(1);
        }
        return combinedFilterMatrix.push(0);
      }
    });

    if (combinedFilterMatrix.indexOf(0) === -1) {
      newList.push(listItem);
    }
  });

  return newList;
};

const filterList = ({ list, range } = {}) => {
  const maxListLength = list.length;
  let start = null;
  let end = null;
  let rangeSpan = null;

  if (range.start > -1) {
    start = range.start;
    end = range.end;
    rangeSpan = end - start;

    if (maxListLength < rangeSpan) {
      end = end > maxListLength ? maxListLength : end;
      start = 1;
    }
  }

  if (start === 0 && end === 0 && !list.length) {
    return [];
  }

  return list.filter((item, index) => (index + 1) >= start && (index + 1) <= end);
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

const updateRange = (range, stateRange, listLength) => {
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

const updateFilter = (filter, currentFilter) => {

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

const sortList = ({ list, sorts, filter, range } = {}) => {
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

const sortListAction = ({ list, sorts, type, filter, range } = {}) =>
  dispatch =>
    dispatch({
      type,
      sorts,
      filter,
      range,
      list: sortList({
        list, sorts, filter, range,
      }),
    });

const getManifestFor = ({ rover, sol, types, offline } = {}) => (dispatch, getState) => {

  // const manifestFor = { rover: (rover && !sol), sol: (rover && sol) };
  const params = { rover, sol, offline };
  const requestPath = '/nasa';
  const request = client => client.get(requestPath, { params });

  return dispatch({
    types,
    promise: request,
  });
};

const _updateList = ({ type: _type, stateKey, sorts, filter, range } = {}) =>
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

export {
  rovers,
  spirit,
  sortList,
  curiosity,
  filterList,
  opportunity,
  updateRange,
  _updateList,
  updateFilter,
  sortListAction,
  getManifestFor,
  filterByFieldValue,
};

