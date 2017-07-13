// import { reinit, reset, requestReinit } from '../../../redux-pouchdb-plus/src/index';
import { startLoading, endLoading } from '../modules/pageLoadBar';
import { KILL_USER, /* SIGNUP_SUCCESS, LOGIN_SUCCESS, */ LOGOUT_SUCCESS /* LOGOUT, logout */ /* , LOAD_AUTH_SUCCESS */ } from '../modules/user';
// import { SYNC_INITIAL } from '../../workers/pouchWorkerMsgTypes';

const clientMiddleware = client => ({ dispatch, getState }) => next => /* async */ (action) => {// eslint-disable-line

  const { promise, types, ...rest } = action;

  if (!promise) {
    return next(action);
  }

  const [REQUEST, SUCCESS, FAILURE] = types;
  // const reinitReducerTypes = [SIGNUP_SUCCESS, LOGIN_SUCCESS];
  // const maybeReinitReducerTypes = [LOAD_AUTH_SUCCESS];

  next({ ...rest, type: REQUEST });
  dispatch(startLoading());
  return promise(client).then((result) => {
    console.log('__CLMW__4', result);

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

    // if (__CLIENT__ && reinitReducerTypes.indexOf(SUCCESS) > -1) {
    //   // return dispatch({ ...rest, result, type: SUCCESS })
    //   dispatch({ ...rest, result, type: SUCCESS });
    //     // .then(async () => {
    //   return (async () => {
    //     dispatch(requestReinit());
    //     const state = getState();
    //     const msg = { user: state.user, ...SYNC_INITIAL };
    //     const sendMsg = state.app.sendMsgToWorker;
    //     await sendMsg(msg);
    //     return dispatch(reinit());
    //   })();
    // }

    if (__CLIENT__ && SUCCESS === LOGOUT_SUCCESS) {
      dispatch({ ...rest, result, type: SUCCESS });
      // dispatch(reset());
      dispatch(endLoading());
    }

    dispatch(endLoading());
    return next({ ...rest, result, type: SUCCESS });
  });
};

export { clientMiddleware };
