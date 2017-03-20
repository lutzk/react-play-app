import { LOCATION_CHANGE } from 'react-router-redux';
import { startLoading, endLoading } from '../modules/pageLoadBar';

const clientMiddleware = client => ({ dispatch, getState }) => next => async (action) => {

  if (typeof action === 'function') {
    return action(dispatch, getState);
  }

  const { promise, types, ...rest } = action;

  if (action.type === LOCATION_CHANGE && action.payload.pathname !== '/' && action.payload.key !== undefined) {
    dispatch(startLoading());
  }

  if (action.type === '@redux-conn/END_GLOBAL_LOAD') {
    dispatch(endLoading());
  }

  if (!promise) {
    return next(action);
  }

  let result = null;
  const [REQUEST, SUCCESS, FAILURE] = types;

  dispatch(startLoading());
  next({ ...rest, type: REQUEST });
  result = await promise(client);

  if (result.error) {
    dispatch(endLoading(true));
    return next({ ...rest, error: result.error, type: FAILURE });
  }

  dispatch(endLoading());
  return next({ ...rest, result, type: SUCCESS });
};

export default clientMiddleware;
