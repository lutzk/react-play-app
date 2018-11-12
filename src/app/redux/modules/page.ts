import { AnyAction, Reducer } from 'redux';
import { NOT_FOUND } from 'redux-first-router';
import { HOME, LOGIN, ROVER_VIEW, SOL_VIEW } from '../routing/nav';

const components = {
  [HOME]: 'Home',
  [LOGIN]: 'Login',
  [SOL_VIEW]: 'SolView',
  [NOT_FOUND]: 'NotFound',
  [ROVER_VIEW]: 'RoverView',
};

interface PageAction {
  type?: string;
}

const initialPageState: string = LOGIN;

// the primary reducer demonstrating Redux-First Router:
const page: Reducer<string> = (
  state = initialPageState,
  action: PageAction = {},
) => components[action.type] || state;

const goToPage = ({ type, payload }) => dispatch =>
  dispatch({
    type,
    payload,
  });

export { page, goToPage, PageAction };
