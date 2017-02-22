import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';

import app from './app';
import marsRovers from './marsRovers';
import pageLoadBar from './pageLoadBar';

export const rootReducer = combineReducers({
  router: routerReducer,
  routing: routerReducer,
  reduxAsyncConnect,
  app,
  marsRovers,
  pageLoadBar
});

export default rootReducer;
