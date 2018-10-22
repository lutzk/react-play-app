import { combineReducers } from 'redux';

import { app, AppState } from './app';
import { page } from './page';
import { pageLoadBar, PageLoadBarState } from './pageLoadBar';
import { roverViewReducer as roverView, RoverViewState } from './roverView';
import { solViewReducer as solView, SolViewState } from './solView';
import { user, UserState } from './user';

interface ApplicationState {
  app: AppState;
  user: UserState;
  page: string;
  solView: SolViewState;
  location: any;
  roverView: RoverViewState;
  pageLoadBar: PageLoadBarState;
}

const createRootReducer = location =>
  combineReducers<ApplicationState>({
    app,
    user,
    page,
    solView,
    location,
    roverView,
    pageLoadBar,
  });

export { createRootReducer };
