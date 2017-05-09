import { reinit, reset } from '../../../redux-pouchdb-plus/src/index';
import { startLoading, endLoading } from '../modules/pageLoadBar';
import { KILL_USER, SIGNUP_SUCCESS, LOGIN_SUCCESS, LOGOUT_SUCCESS /* , LOAD_AUTH_SUCCESS */ } from '../modules/user';

const clientMiddleware = client => ({ dispatch, getState }) => next => async (action) => {

  const { promise, types, ...rest } = action;

  if (!promise) {
    return next(action);
  }

  let result = null;
  const [REQUEST, SUCCESS, FAILURE] = types;
  const reinitReducerTypes = [SIGNUP_SUCCESS, LOGIN_SUCCESS];
  // const maybeReinitReducerTypes = [LOAD_AUTH_SUCCESS];

  next({ ...rest, type: REQUEST });
  dispatch(startLoading());
  result = await promise(client);

  if (result.error) {
    if (result.error.status === 401) {
      dispatch(endLoading(true));
      return next({
        ...rest,
        result: { savedPath: getState().router.locationBeforeTransitions.pathname },
        type: KILL_USER,
      });
    }

    if (result.error.status === 500) {
      dispatch(endLoading(true));
      return next({ ...rest, error: result.error, type: FAILURE });
    }
    dispatch(endLoading(true));
    return next({ ...rest, error: result.error, type: FAILURE });
  }

  if (__CLIENT__ && reinitReducerTypes.indexOf(SUCCESS) > -1) {
    return dispatch({ ...rest, result, type: SUCCESS })
      .then(dispatch(reinit()));
  }

  if (__CLIENT__ && SUCCESS === LOGOUT_SUCCESS) {
    return dispatch({ ...rest, result, type: SUCCESS })
      .then(dispatch(reset()))
      .then(dispatch(endLoading()));
  }

  if (__CLIENT__ && SUCCESS === LOGOUT_SUCCESS) {
    return dispatch({ ...rest, result, type: SUCCESS })
      .then(dispatch(reset()))
      .then(dispatch(endLoading()));
  }

  dispatch(endLoading());
  return next({ ...rest, result, type: SUCCESS });
};

export { clientMiddleware };
