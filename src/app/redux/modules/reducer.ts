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
  _combineReducers({
    app,
    user,
    page,
    solView,
    location,
    roverView,
    pageLoadBar,
  });

const _combineReducers = reducers => {
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

  return function combination(state: any = {}, action) {
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
    const nextState = {};
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      let nextStateForKey;
      if (key === 'roverView' || key === 'solView') {
        nextStateForKey = reducer(previousStateForKey, {
          ...action,
          user: state.user,
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

// const createRootReducer = location => (state: any = {}, action: any) => {
//   const userState = state.user;
//   return {
//     app,
//     user,
//     page,
//     solView: solView(state.solView, { ...userState }),
//     location,
//     roverView: roverView(state.roverView, { ...userState }),
//     pageLoadBar,
//     // languages: languages(state.languages, action),
//     // // merge languageCodes with original action object, now you have access in translations reducer
//     // translations: translations(state.translations, {...action, languageCodes})
//   };
// };

export { createRootReducer, ApplicationState };
