import { combineReducers, ReducersMapObject } from 'redux';
import { Reducer } from 'redux';
import { app, AppState } from './app';
import { page } from './page';
import { pageLoadBar, PageLoadBarState } from './pageLoadBar';
import { roverViewReducer as roverView, RoverViewState } from './roverView';
import { solViewReducer as solView, SolViewState } from './solView';
import { APP_ACTIONS } from './types';
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
  _combineReducers({
    app,
    user,
    page,
    solView,
    location,
    roverView,
    pageLoadBar,
  });

const _combineReducers = (
  reducers: ReducersMapObject<ApplicationState, APP_ACTIONS>,
): Reducer<ApplicationState, APP_ACTIONS> => {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        console.warn(`No reducer provided for key "${key}"`);
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);

  // let unexpectedKeyCache;
  // if (process.env.NODE_ENV !== 'production') {
  //   unexpectedKeyCache = {};
  // }

  // let shapeAssertionError;
  // try {
  //   assertReducerShape(finalReducers);
  // } catch (e) {
  //   shapeAssertionError = e;
  // }

  return function combination(
    state: ApplicationState,
    action: APP_ACTIONS,
  ): ApplicationState {
    // if (shapeAssertionError) {
    //   throw shapeAssertionError;
    // }

    // if (process.env.NODE_ENV !== 'production') {
    //   const warningMessage = getUnexpectedStateShapeWarningMessage(
    //     state,
    //     finalReducers,
    //     action,
    //     unexpectedKeyCache,
    //   );
    //   if (warningMessage) {
    //     console.warn(warningMessage);
    //   }
    // }

    let hasChanged = false;
    const nextState = {} as ApplicationState;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      let nextStateForKey;
      if (key === 'roverView' || key === 'solView') {
        nextStateForKey = reducer(previousStateForKey, {
          ...action,
          user: (state as ApplicationState).user,
        });
      } else {
        nextStateForKey = reducer(previousStateForKey, action);
      }
      if (typeof nextStateForKey === 'undefined') {
        // const errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error('some key was undef');
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
};

export { createRootReducer, ApplicationState };
