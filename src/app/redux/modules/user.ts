import produce from 'immer';
import { Action, Reducer } from 'redux';
import { ApiClient } from '../../../helpers/ApiClient';
import { RedirectAction } from '../routing/nav';
import { linkToLogin } from '../routing/navHelpers';
import { ApplicationState } from './reducer';
import { myRedirect, PromiseAction, Thunk } from '../store/types';

enum USER_TYPES {
  LOGIN = 'user/LOGIN',
  LOGIN_SUCCESS = 'user/LOGIN_SUCCESS',
  LOGIN_FAIL = 'user/LOGIN_FAIL',
  SIGNUP = 'user/SIGNUP',
  SIGNUP_SUCCESS = 'user/SIGNUP_SUCCESS',
  SIGNUP_FAIL = 'user/SIGNUP_FAIL',
  LOAD_AUTH = 'user/LOAD_AUTH',
  LOAD_AUTH_SUCCESS = 'user/LOAD_AUTH_SUCCESS',
  LOAD_AUTH_FAIL = 'user/LOAD_AUTH_FAIL',
  LOGOUT = 'user/LOGOUT',
  LOGOUT_SUCCESS = 'user/LOGOUT_SUCCESS',
  LOGOUT_FAIL = 'user/LOGOUT_FAIL',
  KILL_USER = 'user/KILL_USER',
}

interface User {
  issued: number;
  expires: number;
  token: string;
  password: string;
  provider: string;
  userId: string;
  userDB: string;
  roles: string[];
}

interface UserState {
  user: User | null;
  savedPath?: any;
  loading: boolean;
  loaded: boolean;
  error?: any;
  loggingOut: boolean;
  loggingIn: boolean;
  signedUp: boolean;
  signingUp: boolean;
  lastLoaded: number;
}

interface UserAction extends PromiseAction {
  type: USER_TYPES;
  result?: any;
  lastLoaded?: any;
  error?: any;
  asyncTypes?: USER_TYPES[];
}

type UserRedirectAction = UserAction | RedirectAction;

const initialState: UserState = {
  user: null,
  loading: false,
  loaded: false,
  loggingOut: false,
  loggingIn: false,
  signedUp: false,
  signingUp: false,
  lastLoaded: null,
  savedPath: null,
};

const user: Reducer<UserState> = (state = initialState, action: UserAction) =>
  produce(state, draft => {
    switch (action.type) {
      case USER_TYPES.KILL_USER:
        draft.user = null;
        draft.savedPath = action.result.savedPath;
        return;

      case USER_TYPES.LOAD_AUTH:
        draft.loading = true;
        draft.lastLoaded = action.lastLoaded;
        return;

      case USER_TYPES.LOAD_AUTH_SUCCESS:
        draft.loading = false;
        draft.loaded = true;
        draft.error = null;
        draft.user =
          typeof action.result === 'object' && Object.keys(action.result).length
            ? action.result
            : null;
        return;

      case USER_TYPES.LOAD_AUTH_FAIL:
        draft.loading = false;
        draft.loaded = false;
        draft.user = null;
        draft.error = action.error;
        return;

      case USER_TYPES.LOGOUT:
        draft.loggingOut = true;
        return;

      case USER_TYPES.LOGOUT_SUCCESS:
        draft.loading = false;
        draft.loaded = false;
        draft.user = null;
        return;

      case USER_TYPES.LOGOUT_FAIL:
        draft.loggingOut = false;
        draft.error = action.error;
        return;

      case USER_TYPES.LOGIN:
        draft.loggingIn = true;
        return;

      case USER_TYPES.LOGIN_SUCCESS:
        draft.loading = false;
        draft.loaded = true;
        draft.user = action.result;
        draft.error = false;
        return;

      case USER_TYPES.LOGIN_FAIL:
        draft.loading = false;
        draft.loaded = false;
        draft.error = action.error;
        return;

      case USER_TYPES.SIGNUP:
        draft.signingUp = true;
        return;

      case USER_TYPES.SIGNUP_SUCCESS:
        draft.signedUp = true;
        draft.signingUp = false;
        draft.error = false;
        draft.loading = false;
        draft.loaded = true;
        draft.user = action.result;
        return;

      case USER_TYPES.SIGNUP_FAIL:
        draft.signedUp = false;
        draft.signingUp = false;
        draft.error = action.error;
        return;
    }
  });

const loginAction = (username, password): UserAction => ({
  type: USER_TYPES.LOGIN,
  asyncTypes: [USER_TYPES.LOGIN_SUCCESS, USER_TYPES.LOGIN_FAIL],
  apiPromise: client => client.post('/login', { data: { username, password } }),
});

const login: Thunk<UserAction> = (username, password) => dispatch =>
  dispatch(loginAction(username, password));

const logoutAction = (): UserAction => ({
  type: USER_TYPES.LOGOUT,
  asyncTypes: [USER_TYPES.LOGOUT_SUCCESS, USER_TYPES.LOGOUT_FAIL],
  apiPromise: client => client.get('/logout'),
});

const logout: Thunk<Promise<UserAction>> = () => async dispatch =>
  dispatch(logoutAction());

const shouldRefresh = (lastLoaded: number, timeNow: number): boolean =>
  lastLoaded && (timeNow - lastLoaded) / 1000 < 10 ? false : true;

const shouldLogout = (expires: number, timeNow: number): boolean =>
  (timeNow - expires) / 1000 > 0 ? true : false;

const loadUser = (timeNow: number): UserAction => ({
  type: USER_TYPES.LOAD_AUTH,
  asyncTypes: [USER_TYPES.LOAD_AUTH_SUCCESS, USER_TYPES.LOAD_AUTH_FAIL],
  lastLoaded: timeNow,
  apiPromise: client => client.get('/loadAuth'),
});

const loadAuth: Thunk<Promise<UserAction | void>> = () => async (
  dispatch,
  getState,
) => {
  const timeNow = new Date().getTime();
  const user = getState().user;
  if (user.user) {
    if (shouldLogout(user.user.expires, timeNow)) {
      return dispatch(logout());
    }
  }
  if (shouldRefresh(user.lastLoaded, timeNow)) {
    return dispatch(loadUser(timeNow));
  }
};

const killUser: Thunk<UserAction> = () => dispatch =>
  dispatch({
    type: USER_TYPES.KILL_USER,
  });

const isLoaded = (state: UserState) => state.loaded;

const signupAction = (
  name,
  username,
  email,
  password,
  confirmPassword,
): UserAction => ({
  type: USER_TYPES.SIGNUP,
  asyncTypes: [USER_TYPES.SIGNUP_SUCCESS, USER_TYPES.SIGNUP_FAIL],
  apiPromise: client =>
    client.post('/signup', {
      data: { name, username, email, password, confirmPassword },
    }),
});

const signup: Thunk<Promise<UserAction>> = (
  name,
  username,
  email,
  password,
  confirmPassword,
) => async dispatch =>
  dispatch(signupAction(name, username, email, password, confirmPassword));

const redirectAction = (nextPathname): UserRedirectAction =>
  myRedirect({
    nextPathname,
    ...linkToLogin,
  });

const checkAuth: Thunk<Promise<UserRedirectAction>> = () => async (
  dispatch,
  getState,
) => {
  const {
    user: { user },
  } = getState();
  if (!user) {
    return dispatch(redirectAction(getState().location.pathname));
  }
};

const requireLogin: Thunk<Promise<UserRedirectAction>> = () => async dispatch =>
  dispatch(loadAuth()).then(r => dispatch(checkAuth()));

export {
  User,
  UserState,
  UserAction,
  user,
  login,
  logout,
  signup,
  loadAuth,
  killUser,
  isLoaded,
  checkAuth,
  requireLogin,
  USER_TYPES,
};
