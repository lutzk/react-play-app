import { reinit, reset, requestReinit } from '../../../redux-pouchdb-plus/src/index';
import { startLoading, endLoading } from '../modules/pageLoadBar';
import { KILL_USER, SIGNUP_SUCCESS, LOGIN_SUCCESS, LOGOUT_SUCCESS /* , LOAD_AUTH_SUCCESS */ } from '../modules/user';
import { SYNC_INITIAL } from '../../workers/pouchWorkerMsgTypes';

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

  const { error } = result;

  if (error) {
    const { status } = error;
    if (status === 401) {
      dispatch(endLoading(true));
      return next({
        ...rest,
        result: { savedPath: getState().router.locationBeforeTransitions.pathname },
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
    return dispatch({ ...rest, result, type: SUCCESS })
      .then(async () => {
        dispatch(requestReinit());
        const state = getState();
        const msg = { user: state.user, ...SYNC_INITIAL };
        const sendMsg = state.app.sendMsgToWorker;
        await sendMsg(msg);
        return dispatch(reinit());
      });
  }

  if (__CLIENT__ && SUCCESS === LOGOUT_SUCCESS) {
    return dispatch({ ...rest, result, type: SUCCESS })
      .then(() => {
        dispatch(reset());
        dispatch(endLoading());
      });
  }

  dispatch(endLoading());
  return next({ ...rest, result, type: SUCCESS });
};

export { clientMiddleware };
