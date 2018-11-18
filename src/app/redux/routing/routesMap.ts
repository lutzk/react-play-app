// import { redirect /* , NOT_FOUND */ } from 'redux-first-router';
import { initPage } from '../modules/roverView';
import {
  /* loadAuth, isLoaded, killUser, */ requireLogin,
} from '../modules/user';
import { PATHS, PATHS_TYPES } from './nav';

const thunk = dispatch => dispatch(requireLogin());
const rthunk = dispatch => dispatch(initPage());

const routesMap = {
  // [LOGIN]: '/',
  [PATHS_TYPES.LOGIN]: {
    path: PATHS[PATHS_TYPES.LOGIN],
    // thunk,
  },
  [PATHS_TYPES.HOME]: {
    path: PATHS[PATHS_TYPES.HOME],
    // thunk,
  },
  [PATHS_TYPES.ROVER_VIEW]: {
    path: `${PATHS[PATHS_TYPES.ROVER_VIEW]}/:rover?`,
    thunk: rthunk,
  },
  [PATHS_TYPES.SOL_VIEW]: {
    path: `${PATHS[PATHS_TYPES.ROVER_VIEW]}/:rover${
      PATHS[PATHS_TYPES.SOL_VIEW]
    }/:sol?`,
    thunk,
  },
};

export { routesMap };
