import {
  reinit,
  reset,
  requestReinit,
} from '../../../redux-pouchdb-plus/src/index';
import { startLoading, endLoading } from '../modules/pageLoadBar';
import {
  KILL_USER,
  SIGNUP_SUCCESS,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
} from '../modules/user';
import { SYNC_INITIAL } from '../../workers/pouchWorkerMsgTypes';
import { linkToSpirit } from '../routing/navTypes';

const clientMiddleware = client => ({
  dispatch,
  getState,
}) => next => action => {
  //
  if (__CLIENT__ && action.type === '@@redux-pouchdb-plus/REINIT_SUCCESS') {
    dispatch(linkToSpirit);
    return next(action);
  }

  const { promise, types, ...rest } = action;

  if (!promise) {
    return next(action);
  }

  const [REQUEST, SUCCESS, FAILURE] = types;
  const reinitReducerTypes = [SIGNUP_SUCCESS, LOGIN_SUCCESS];

  next({ ...rest, type: REQUEST });
  dispatch(startLoading());
  return promise(client).then(result => {
    const { error } = result;

    if (error) {
      const { status } = error;
      if (status === 401) {
        dispatch(endLoading(true));
        dispatch({ type: FAILURE, error });
        return next({
          ...rest,
          result: { savedPath: getState().location.pathname },
          type: KILL_USER,
        });
      }

      if (status === 500) {
        dispatch(endLoading(true));
        return next({ ...rest, error, type: FAILURE });
      }
      dispatch(endLoading(true));
      return next({ ...rest, error, type: FAILURE });
    }

    if (__CLIENT__ && reinitReducerTypes.indexOf(SUCCESS) > -1) {
      dispatch(requestReinit());
      dispatch({ ...rest, result, type: SUCCESS });
      const state = getState();
      const msg = { user: state.user, ...SYNC_INITIAL };
      const sendMsg = state.app.sendMsgToWorker;
      return (async () => {
        await sendMsg(msg);
        return dispatch(reinit());
      })();
    }

    if (__CLIENT__ && SUCCESS === LOGOUT_SUCCESS) {
      dispatch(reset());
      dispatch({ ...rest, result, type: SUCCESS });
      dispatch(endLoading());
    }

    dispatch(endLoading());
    return next({ ...rest, result, type: SUCCESS });
  });
};

export { clientMiddleware };
