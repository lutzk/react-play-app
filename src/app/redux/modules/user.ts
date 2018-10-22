import { AnyAction, Reducer } from 'redux';
import { redirect /* , NOT_FOUND */ } from 'redux-first-router';
import { linkToLogin } from '../routing/navTypes';

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

interface UserState {
  user: any;
  savedPath?: any;
  loading: boolean;
  loaded: boolean;
  error?: any;
  loggingOut: boolean;
  loggingIn: boolean;
  signedUp: boolean;
  signingUp: boolean;
}

interface Result {
  savedPath: any;
}

interface UserAction extends AnyAction {
  result?: any;
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
};

const user: Reducer<UserState> = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case KILL_USER:
      return {
        ...state,
        user: null,
        savedPath: action.result.savedPath,
      };
    case LOAD_AUTH:
      return {
        ...state,
        loading: true,
        lastLoaded: action.lastLoaded,
      };
    case LOAD_AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        error: null,
        user:
          typeof action.result === 'object' && Object.keys(action.result).length
            ? action.result
            : null,
      };
    case LOAD_AUTH_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        user: null,
        error: action.error,
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: false,
        user: null,
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        error: action.error,
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result,
        error: false,
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error,
      };
    case SIGNUP:
      return {
        ...state,
        signingUp: true,
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        signedUp: true,
        signingUp: false,
        error: false,
        loading: false,
        loaded: true,
        user: action.result,
      };
    case SIGNUP_FAIL:
      return {
        ...state,
        signedUp: false,
        signingUp: false,
        error: action.error,
      };
    default:
      return state;
  }
};

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
  // eslint-disable-line
  const {
    user: { user },
  } = getState(); // eslint-disable-line
  if (!user) {
    const action = redirect({
      ...linkToLogin,
      nextPathname: getState().location.pathname,
    });
    return dispatch(redirect(action));
  }
  return Promise.resolve(true);
};

const requireLogin = () => (dispatch, getState) =>
  dispatch(loadAuth()).then(r => dispatch(checkAuth()));

export {
  Result,
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
