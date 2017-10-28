import { NOT_FOUND } from 'redux-first-router';
import {
  HOME,
  LOGIN,
  SOL_VIEW,
  ROVER_VIEW,
} from '../routing/nav';

const components = {
  [HOME]: 'Home',
  [LOGIN]: 'Login',
  [SOL_VIEW]: 'SolView',
  [NOT_FOUND]: 'NotFound',
  [ROVER_VIEW]: 'RoverView',
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
