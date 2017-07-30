// import { redirect /* , NOT_FOUND */ } from 'redux-first-router';
import { /* loadAuth, isLoaded, killUser, */ requireLogin } from '../modules/user';// eslint-disable-line
import { HOME, LOGIN, ROVER_VIEW, SOL_VIEW, PATHS } from './nav';

const thunk = (dispatch, getState) => dispatch(requireLogin());
const rthunk = (dispatch, getState) => dispatch(requireLogin());

const routesMap = {
  // [LOGIN]: '/',
  [LOGIN]: {
    path: PATHS[LOGIN],
    // thunk,
  },
  [HOME]: {
    path: PATHS[HOME],
    thunk,
  },
  [ROVER_VIEW]: {
    path: `${PATHS[ROVER_VIEW]}/:rover`,
    thunk: rthunk,
  },
  [SOL_VIEW]: {
    path: `${PATHS[ROVER_VIEW]}/:rover${PATHS[SOL_VIEW]}/:sol`,
    thunk,
  },
};

export { routesMap };