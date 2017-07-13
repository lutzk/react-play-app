import { redirect /* , NOT_FOUND */ } from 'redux-first-router';
import { loadAuth, isLoaded, killUser } from '../modules/user';// eslint-disable-line

const requireLogin = (dispatch, getState) => {
  const checkAuth = () => {
    const { user: { user } } = getState();
    if (!user) {
      const action = redirect({ type: 'LOGIN', nextPathname: getState().location.pathname });// eslint-disable-line
      dispatch(action);
    }
  };

  if (!isLoaded(getState())) {
    Promise.resolve(dispatch(loadAuth()))
      .then(() => checkAuth());
  } else {
    checkAuth();
  }
};

const routesMap = {
  // LOGIN: '/',
  LOGIN: '/login',
  HOME: {
    path: '/home',
    thunk: requireLogin,
  },
  ROVER_VIEW: {
    path: '/rover-view/:rover',
    thunk: requireLogin,
  },
};

export { routesMap };
