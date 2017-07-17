// import { redirect /* , NOT_FOUND */ } from 'redux-first-router';
import { /* loadAuth, isLoaded, killUser, */ requireLogin } from '../modules/user';// eslint-disable-line
import { HOME, LOGIN, ROVER_VIEW, PATHS } from './nav';

const thunk = async (dispatch, getState) => {
  await dispatch(requireLogin());
};

const routesMap = {
  // [LOGIN]: '/',
  [LOGIN]: {
    path: PATHS[LOGIN],
    thunk,
  },
  [HOME]: {
    path: PATHS[HOME],
    thunk,
  },
  [ROVER_VIEW]: {
    path: `${PATHS[ROVER_VIEW]}/:rover`,
    thunk,
  },
  SOL: {
    path: `${PATHS[ROVER_VIEW]}/:rover/sol/:sol`,
    thunk,
  },
};

export { routesMap };
