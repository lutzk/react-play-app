import { LOCATION_CHANGE } from 'react-router-redux';
import { startLoading, endLoading } from '../modules/pageLoadBar';

// import CALL_HISTORY_METHOD from 'react-router-redux';
// import { beginGlobalLoad, endGlobalLoad } from 'redux-connect/lib/store';

// const REDUX_ASYNC_LOAD = '@redux-conn/LOAD';
// const REDUX_ASYNC_LOAD_SUCCESS = '@redux-conn/LOAD_SUCCESS';
// const REDUX_ASYNC_LOAD_FAIL = '@redux-conn/LOAD_FAIL';
// const REDUX_GLOBAL_LOAD_BEGIN = @redux-conn/GLOBAL_LOAD_BEGIN;
// const REDUX_GLOBAL_LOAD_END = @redux-conn/GLOBAL_LOAD_END;

// const REDUX_GLOBAL_LOAD_BEGIN = beginGlobalLoad.toString();
// const REDUX_GLOBAL_LOAD_END = endGlobalLoad.toString();

export default function clientMiddleware(client) {
  return ({ dispatch, getState }) => {
    return next => (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      // if (action.type === REDUX_GLOBAL_LOAD_BEGIN) {
      //   dispatch(startLoading());
      // }

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

      const [REQUEST, SUCCESS, FAILURE] = types;

      dispatch(startLoading());
      next({ ...rest, type: REQUEST });

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
        dispatch(endLoading(true));
        console.error('MIDDLEWARE ERROR:', error);
        next({ ...rest, error, type: FAILURE });
      });
    };
  };
}
