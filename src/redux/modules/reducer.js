import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';

import app from './app';
import roverView from './roverView';
import pageLoadBar from './pageLoadBar';

export const rootReducer = combineReducers({
  router: routerReducer,
  routing: routerReducer,
  reduxAsyncConnect,
  app,
  roverView,
  pageLoadBar,
});

export default rootReducer;
