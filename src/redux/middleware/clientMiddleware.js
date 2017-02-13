// import CALL_HISTORY_METHOD from 'react-router-redux';
// import { LOCATION_CHANGE } from 'react-router-redux';

export default function clientMiddleware(client) {
  return ({ dispatch, getState }) => {
    return next => (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      const { promise, types, ...rest } = action;
      if (!promise) {

        return next(action);
      }

      const [REQUEST, SUCCESS, FAILURE] = types;
      next({ ...rest, type: REQUEST });
      return promise(client).then(

        (result) => {
          return next({ ...rest, result, type: SUCCESS });
        },
        (error) => {
          return next({ ...rest, error, type: FAILURE });
        }
      ).catch((error) => {
        console.error('MIDDLEWARE ERROR:', error);
        next({ ...rest, error, type: FAILURE });
      });
    };
  };
}
