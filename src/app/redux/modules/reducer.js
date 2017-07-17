import { combineReducers } from 'redux';
// import { reducer as reduxAsyncConnect } from 'redux-connect';

import { app } from './app';
import { user } from './user';
import { page } from './page';
import { pageLoadBar } from './pageLoadBar';
import { solViewReducer as solView } from './solView';
import { roverViewReducer as roverView } from './roverView';

const createRootReducer = location => combineReducers({
  app,
  user,
  page,
  solView,
  location,
  roverView,
  pageLoadBar,
  // reduxAsyncConnect,
});

export { createRootReducer };
