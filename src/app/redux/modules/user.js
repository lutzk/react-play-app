export const LOGIN = 'user/LOGIN';
export const LOGIN_SUCCESS = 'user/LOGIN_SUCCESS';
export const LOGIN_FAIL = 'user/LOGIN_FAIL';

export const SIGNUP = 'user/SIGNUP';
export const SIGNUP_SUCCESS = 'user/SIGNUP_SUCCESS';
export const SIGNUP_FAIL = 'user/SIGNUP_FAIL';

export const LOAD_AUTH = 'user/LOAD_AUTH';
export const LOAD_AUTH_SUCCESS = 'user/LOAD_AUTH_SUCCESS';
export const LOAD_AUTH_FAIL = 'user/LOAD_AUTH_FAIL';

export const LOGOUT = 'user/LOGOUT';
export const LOGOUT_SUCCESS = 'user/LOGOUT_SUCCESS';
export const LOGOUT_FAIL = 'user/LOGOUT_FAIL';

export const KILL_USER = 'user/KILL_USER';

const initialState = {
  loggedIn: false,
  loggingIn: false,
  error: false,
  lastLoaded: null,
};

export default function user(state = initialState, action = {}) {
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
        user: (typeof action.result === 'object' && Object.keys(action.result).length) ? action.result : null,
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
}

export function login(username, password) {

  const types = [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL];
  const request = client => client.post('/login', { data: { username, password } });

  return {
    types,
    promise: request,
  };
}

export const loadAuth = () => (dispatch, getState) => {
  const timeNow = new Date().getTime();
  const lastLoaded = getState().user.lastLoaded;
  if (lastLoaded) {
    if (((timeNow - lastLoaded) / 1000) < 5) {
      return false;
    }
  }

  return dispatch({
    types: [LOAD_AUTH, LOAD_AUTH_SUCCESS, LOAD_AUTH_FAIL],
    lastLoaded: timeNow,
    promise: client => client.get('/loadAuth'),
  });
};

export function killUser() {
  return {
    type: [KILL_USER],
  };
}

export function isLoaded(state) {
  return state.user && state.user.loaded;
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: client => client.get('/logout'),
  };
}

export function signup(name, username, email, password, confirmPassword) {

  const types = [SIGNUP, SIGNUP_SUCCESS, SIGNUP_FAIL];
  const request = client => client.post('/signup', { data: { name, username, email, password, confirmPassword } });

  return {
    types,
    promise: request,
  };
}