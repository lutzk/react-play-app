import { Reducer } from 'redux';
import { PATHS_TYPES } from '../routing/nav';

const components = {
  [PATHS_TYPES.HOME]: 'Home',
  [PATHS_TYPES.LOGIN]: 'Login',
  [PATHS_TYPES.SOL_VIEW]: 'SolView',
  [PATHS_TYPES.NOT_FOUND]: 'NotFound',
  [PATHS_TYPES.ROVER_VIEW]: 'RoverView',
};

interface PageAction {
  type: PATHS_TYPES;
}

const initialPageState = PATHS_TYPES.LOGIN;

// the primary reducer demonstrating Redux-First Router:
const page: Reducer<string> = (
  state = initialPageState,
  action: PageAction = { type: initialPageState },
) => components[action.type] || state;

const goToPage = ({ type, payload }) => dispatch => {
  console.log('GO', type, payload);
  return dispatch({
    type,
    payload,
  });
};

export { page, goToPage, PageAction };
