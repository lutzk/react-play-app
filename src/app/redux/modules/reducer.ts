import { combineReducers } from 'redux';

import { app, AppState } from './app';
import { user, UserState } from './user';
import { page } from './page';
import { pageLoadBar, PageLoadBarState } from './pageLoadBar';
import { solViewReducer as solView, SolViewState } from './solView';
import { roverViewReducer as roverView, RoverViewState } from './roverView';

interface ApplicationState {
  app: AppState;
  user: UserState;
  page: string;
  solView: SolViewState;
  location: any;
  roverView: RoverViewState;
  pageLoadBar: PageLoadBarState;
}

const createRootReducer = location => combineReducers<ApplicationState>({
  app,
  user,
  page,
  solView,
  location,
  roverView,
  pageLoadBar,
});

export { createRootReducer };
