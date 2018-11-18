import { AnyAction } from 'redux';

enum PATHS_TYPES {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  SOL_VIEW = 'SOL_VIEW',
  ROVER_VIEW = 'ROVER_VIEW',
  NOT_FOUND = 'NOT_FOUND',
}

const PATHS = {
  // [ROOT]: '/',
  [PATHS_TYPES.HOME]: '/home',
  [PATHS_TYPES.LOGIN]: '/login',
  [PATHS_TYPES.SOL_VIEW]: '/sol',
  [PATHS_TYPES.ROVER_VIEW]: '/rover-view',
};

interface RedirectAction extends AnyAction {
  nextPathname: string;
}

export { PATHS, PATHS_TYPES, RedirectAction };
