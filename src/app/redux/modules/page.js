import { NOT_FOUND } from 'redux-first-router';

const components = {
  HOME: 'Home',
  ROVER_VIEW: 'RoverView',
  LOGIN: 'Login',
  [NOT_FOUND]: 'NotFound',
};

// the primary reducer demonstrating Redux-First Router:
const page = (state = 'LOGIN', action = {}) =>
  components[action.type] || state;

const goToPage = ({ type, payload }) => dispatch => {
  console.log('__GO_TO_PAGE__', type, payload);
  return dispatch({
    type,
    payload,
  });
};

export { page, goToPage };
