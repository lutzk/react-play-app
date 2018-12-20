import { Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { ApiClient } from '../../../helpers/ApiClient';
import {
  POUCH_ACTION_TYPES,
  reset,
} from '../../../redux-pouchdb-plus/src/index';
import { syncInitial, reinitReducers } from '../modules/app';
import { endLoading, startLoading } from '../modules/pageLoadBar';
import { ApplicationState } from '../modules/reducer';
import {
  APP_ACTIONS,
  isAsyncAction,
  isPouchPromiseAction,
  MyThunkDispatch,
} from '../modules/types';
import { USER_TYPES } from '../modules/user';
import { linkToSpirit } from '../routing/navHelpers';

const clientMiddleware = (client: ApiClient): Middleware => ({
  dispatch,
  getState,
}: MiddlewareAPI<MyThunkDispatch, ApplicationState>) => (
  next: Dispatch<APP_ACTIONS>,
) => (action: APP_ACTIONS): Promise<any> | APP_ACTIONS => {
  if (__CLIENT__ && action.type === POUCH_ACTION_TYPES.REINIT_SUCCESS) {
    dispatch(linkToSpirit);
    return next(action);
  }

  if (!isAsyncAction(action)) {
    return next(action);
  }

  const { type, asyncTypes, apiPromise, pouchPromise, ...rest } = action;

  if (!(apiPromise || pouchPromise)) {
    return next(action);
  }

  const [REQUEST, SUCCESS, FAILURE] = [type, ...asyncTypes];
  const reinitReducerTypes = [
    USER_TYPES.SIGNUP_SUCCESS,
    USER_TYPES.LOGIN_SUCCESS,
  ];

  next({ ...rest, type: REQUEST } as APP_ACTIONS);
  dispatch(startLoading());

  // move to extra mw
  if (isPouchPromiseAction(action)) {
    if (action.type === POUCH_ACTION_TYPES.REINIT_REDUCERS) {
      const pp = pouchPromise();
      next({ type: POUCH_ACTION_TYPES.REINIT });
      return pp
        .then()
        .then(r => {
          dispatch(endLoading());
          return dispatch({ type: SUCCESS });
        })
        .catch(e => {
          dispatch(endLoading(true));
          return dispatch({ type: FAILURE });
        });
    }
    return pouchPromise()
      .then(r => {
        dispatch(endLoading());
        return dispatch({ type: SUCCESS });
      })
      .catch(e => {
        dispatch(endLoading(true));
        return dispatch({ type: FAILURE });
      });
  }

  return apiPromise(client).then(result => {
    const { error } = result;

    if (error) {
      const { status } = error;
      if (status === 401) {
        dispatch(endLoading(true));
        dispatch({ type: FAILURE, error });
        return next({
          ...rest,
          result: { savedPath: getState().location.pathname },
          type: USER_TYPES.KILL_USER,
        } as any);
      }

      if (status === 500) {
        dispatch(endLoading(true));
        return dispatch({ ...rest, error, type: FAILURE });
      }
      dispatch(endLoading(true));
      return dispatch({ ...rest, error, type: FAILURE });
    }

    if (__CLIENT__ && reinitReducerTypes.indexOf(SUCCESS as USER_TYPES) > -1) {
      dispatch({ ...rest, result, type: SUCCESS });
      return dispatch(syncInitial()).then(r => dispatch(reinitReducers()));
    }

    if (__CLIENT__ && SUCCESS === USER_TYPES.LOGOUT_SUCCESS) {
      dispatch(reset());
      dispatch({ ...rest, result, type: SUCCESS });
      return dispatch(endLoading());
    }

    dispatch(endLoading());
    return dispatch({ ...rest, result, type: SUCCESS });
  });
};

export { clientMiddleware };
