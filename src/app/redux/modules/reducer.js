import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';

import { app } from './app';
import { user } from './user';
import { solViewReducer as solView } from './solView';
import { roverViewReducer as roverView } from './roverView';
import { pageLoadBar } from './pageLoadBar';
import { page } from './page';

const createRootReducer = location => combineReducers({
  location,
  page,
  // router: routerReducer,
  // routing: routerReducer,
  // reduxAsyncConnect,
  app,
  user,
  solView,
  roverView,
  pageLoadBar,
});

const rootReducer = combineReducers({
  router: routerReducer,
  routing: routerReducer,
  reduxAsyncConnect,
  app,
  user,
  solView,
  roverView,
  pageLoadBar,
});

export { rootReducer, createRootReducer };
