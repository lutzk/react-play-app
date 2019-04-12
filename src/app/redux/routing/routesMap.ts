import {
  RoutesMap /*redirect  , NOT_FOUND */,
  RouteThunk,
} from 'redux-first-router';
import { ApplicationState } from '../modules/reducer';
import { initPage } from '../modules/roverView';
import { MyThunkDispatch } from '../modules/types';
import {
  /* loadAuth, isLoaded, killUser, */ requireLogin,
} from '../modules/user';
import { PATHS, PATHS_TYPES } from './nav';

const rthunk: RouteThunk<ApplicationState> = dispatch => dispatch(initPage());

const thunk: RouteThunk<ApplicationState> = dispatch =>
  dispatch(requireLogin());

const routesMap: RoutesMap<{}, ApplicationState> = {
  // [LOGIN]: '/',
  [PATHS_TYPES.LOGIN]: {
    path: PATHS[PATHS_TYPES.LOGIN],
    // thunk,
  },
  [PATHS_TYPES.HOME]: {
    path: PATHS[PATHS_TYPES.HOME],
    thunk,
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
