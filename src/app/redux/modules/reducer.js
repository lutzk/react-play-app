import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';

import app from './app';
import user from './user';
import solView from './solView';
import roverView from './roverView';
import pageLoadBar from './pageLoadBar';

export const rootReducer = combineReducers({
  router: routerReducer,
  routing: routerReducer,
  reduxAsyncConnect,
  app,
  user,
  solView,
  roverView,
  pageLoadBar,
});

export default rootReducer;
