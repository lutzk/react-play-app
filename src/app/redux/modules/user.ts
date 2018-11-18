import produce from 'immer';
import { AnyAction, Reducer } from 'redux';
import { redirect /* , NOT_FOUND */ } from 'redux-first-router';
import { RedirectAction } from '../routing/nav';
import { linkToLogin } from '../routing/navHelpers';

const LOGIN = 'user/LOGIN';
const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS';
const LOGIN_FAIL = 'user/LOGIN_FAIL';

const SIGNUP = 'user/SIGNUP';
const SIGNUP_SUCCESS = 'user/SIGNUP_SUCCESS';
const SIGNUP_FAIL = 'user/SIGNUP_FAIL';

const LOAD_AUTH = 'user/LOAD_AUTH';
const LOAD_AUTH_SUCCESS = 'user/LOAD_AUTH_SUCCESS';
const LOAD_AUTH_FAIL = 'user/LOAD_AUTH_FAIL';

const LOGOUT = 'user/LOGOUT';
const LOGOUT_SUCCESS = 'user/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'user/LOGOUT_FAIL';

const KILL_USER = 'user/KILL_USER';

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

interface UserAction extends AnyAction {
  result?: User;
  lastLoaded?: any;
  error?: any;
}

const initialState: UserState = {
  user: null,
  loading: false,
  loaded: false,
  loggingOut: false,
  loggingIn: false,
  signedUp: false,
  signingUp: false,
  lastLoaded: null,
};

const user: Reducer<UserState> = (state = initialState, action: AnyAction) =>
  produce(state, draft => {
    switch (action.type) {
      case KILL_USER:
        draft.user = null;
        draft.savedPath = action.result.savedPath;
        return;

      case LOAD_AUTH:
        draft.loading = true;
        draft.lastLoaded = action.lastLoaded;
        return;

      case LOAD_AUTH_SUCCESS:
        draft.loading = false;
        draft.loaded = true;
        draft.error = null;
        draft.user =
          typeof action.result === 'object' && Object.keys(action.result).length
            ? action.result
            : null;
        return;

      case LOAD_AUTH_FAIL:
        draft.loading = false;
        draft.loaded = false;
        draft.user = null;
        draft.error = action.error;
        return;

      case LOGOUT:
        draft.loggingOut = true;
        return;

      case LOGOUT_SUCCESS:
        draft.loading = false;
        draft.loaded = false;
        draft.user = null;
        return;

      case LOGOUT_FAIL:
        draft.loggingOut = false;
        draft.error = action.error;
        return;

      case LOGIN:
        draft.loggingIn = true;
        return;

      case LOGIN_SUCCESS:
        draft.loading = false;
        draft.loaded = true;
        draft.user = action.result;
        draft.error = false;
        return;

      case LOGIN_FAIL:
        draft.loading = false;
        draft.loaded = false;
        draft.error = action.error;
        return;

      case SIGNUP:
        draft.signingUp = true;
        return;

      case SIGNUP_SUCCESS:
        draft.signedUp = true;
        draft.signingUp = false;
        draft.error = false;
        draft.loading = false;
        draft.loaded = true;
        draft.user = action.result;
        return;

      case SIGNUP_FAIL:
        draft.signedUp = false;
        draft.signingUp = false;
        draft.error = action.error;
        return;
    }
  });

const login = (username, password) => dispatch => {
  const types = [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL];
  const promise = client =>
    client.post('/login', { data: { username, password } });
  return dispatch({
    types,
    promise,
  });
};

const logout = () => dispatch => {
  const types = [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL];
  const promise = client => client.get('/logout');
  return dispatch({ types, promise });
};

const shouldRefreshOrLogout = (state, timeNow) => {
  const lastLoaded = state.user.lastLoaded;
  let justLoaded = false;
  let expires: number;
  const _timeNow = Number(timeNow);
  // let issued = false;
  if (state.user.user) {
    // issued = state.user.user.issued;
    expires = Number(state.user.user.expires);
    if ((_timeNow - expires) / 1000 > 0) {
      return logout();
    }
  }

  if (lastLoaded) {
    if ((_timeNow - lastLoaded) / 1000 < 10) {
      justLoaded = true;
    }
  }
  return !justLoaded;
};

const loadAuth = () => (dispatch, getState) => {
  const timeNow = new Date().getTime();
  if (!shouldRefreshOrLogout(getState(), timeNow)) {
    return Promise.resolve(false);
  }
  return dispatch({
    types: [LOAD_AUTH, LOAD_AUTH_SUCCESS, LOAD_AUTH_FAIL],
    lastLoaded: timeNow,
    promise: client => client.get('/loadAuth'),
  });
};

const killUser = () => (getState, dispatch) =>
  dispatch({
    type: [KILL_USER],
  });

function isLoaded(state) {
  return state.user && state.user.loaded;
}

const signup = (
  name,
  username,
  email,
  password,
  confirmPassword,
) => dispatch => {
  const types = [SIGNUP, SIGNUP_SUCCESS, SIGNUP_FAIL];
  const promise = client =>
    client.post('/signup', {
      data: { name, username, email, password, confirmPassword },
    });

  return dispatch({ types, promise });
};

const checkAuth = () => (dispatch, getState) => {
  const {
    user: { user },
  } = getState();
  if (!user) {
    const action = redirect({
      ...linkToLogin,
      nextPathname: getState().location.pathname,
    } as RedirectAction);
    return dispatch(redirect(action));
  }
  return Promise.resolve(true);
};

const requireLogin = () => (dispatch, getState) =>
  dispatch(loadAuth()).then(r => dispatch(checkAuth()));

export {
  User,
  UserState,
  UserAction,
  user,
  login,
  logout,
  LOGOUT,
  signup,
  loadAuth,
  killUser,
  isLoaded,
  KILL_USER,
  checkAuth,
  LOGIN_SUCCESS,
  SIGNUP_SUCCESS,
  LOGOUT_SUCCESS,
  LOGIN,
  LOGIN_FAIL,
  LOGOUT_FAIL,
  LOAD_AUTH,
  LOAD_AUTH_SUCCESS,
  LOAD_AUTH_FAIL,
  requireLogin,
};
