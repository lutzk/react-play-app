// import CALL_HISTORY_METHOD from 'react-router-redux';
// import { LOCATION_CHANGE } from 'react-router-redux';

// import { beginGlobalLoad, endGlobalLoad } from 'redux-connect/lib/store';// eslint-disable-line
import { LOADING, endLoading } from '../modules/pageLoadBar';

// const REDUX_GLOBAL_LOAD_BEGIN = beginGlobalLoad.toString();
// const REDUX_GLOBAL_LOAD_END = endGlobalLoad.toString();

export default function clientMiddleware(client) {
  return ({ dispatch, getState }) => {
    return next => (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      // if (action.type === REDUX_GLOBAL_LOAD_BEGIN) {
      //   dispatch({ type: LOADING });
      // }

      // if (action.type === REDUX_GLOBAL_LOAD_END) {
      //   dispatch({ type: END_LOADING });
      // }

      const { promise, types, ...rest } = action;

      if (!promise) {
        return next(action);
      }

      const [REQUEST, SUCCESS, FAILURE] = types;

      next({ ...rest, type: REQUEST });
      dispatch({ type: LOADING });
      return promise(client).then(

        (result) => {
          if (result === null || result.code === 'ENOTFOUND' || (result.status === undefined && result.stack !== undefined)) {
            dispatch(endLoading(true));
            return next({ ...rest, error: 'offline', type: FAILURE });
          }
          dispatch(endLoading());
          return next({ ...rest, result, type: SUCCESS });
        },

        (error) => {
          dispatch(endLoading(true));
          return next({ ...rest, error, type: FAILURE });
        }
      )
      .catch((error) => {
        console.error('MIDDLEWARE ERROR:', error);
        next({ ...rest, error, type: FAILURE });
      });
    };
  };
}
