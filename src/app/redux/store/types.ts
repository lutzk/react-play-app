import {
  Action,
  ActionCreator,
  AnyAction,
  Dispatch,
  Middleware,
  Store,
  MiddlewareAPI,
} from 'redux';
import { redirect, RouteThunk } from 'redux-first-router';
import { ApiClient } from '../../../helpers/ApiClient';
import { PouchAction } from '../../../redux-pouchdb-plus/src';
import { RedirectAction } from '../routing/nav';
import { AppAction } from '../modules/app';
import { PageAction } from '../modules/page';
import { PageLoadBarAction } from '../modules/pageLoadBar';
import { ApplicationState } from '../modules/reducer';
import { RoverViewAction } from '../modules/roverView';
import { SolViewAction } from '../modules/solView';
import { UserAction } from '../modules/user';

export type PromiseDispatch = <T extends Action>(
  promise: Promise<T>,
) => Promise<T>;

function promise() {
  const promiseMiddleware: Middleware<
    MyThunkDispatch & PromiseDispatch,
    ApplicationState
  > = ({ dispatch }: MiddlewareAPI) => next => <T extends Action>(
    action: AnyAction | Promise<T>,
  ) => {
    if (action instanceof Promise) {
      action.then(dispatch);
      return action;
    }

    return next(action);
  };

  return promiseMiddleware;
}

type ThunkD<R, S, DispatchExt = {}> = (
  dispatch: Dispatch & ThunkDispatch<S> & DispatchExt,
  getState: () => S,
) => R;

type ThunkDispatch<S, DispatchExt = {}> = <R>(
  thunk: ThunkD<R, S, DispatchExt>,
) => R;

function thunkMiddleware<S, DispatchExt>() {
  const thunkMiddleware: Middleware<
    ThunkDispatch<S, DispatchExt>,
    S,
    Dispatch & ThunkDispatch<S>
  > = api => (next: Dispatch) => <R>(action: AnyAction | ThunkD<R, any>) =>
    typeof action === 'function'
      ? action(api.dispatch, api.getState)
      : next(action);

  return thunkMiddleware;
}

type actionPromise = () => Promise<any>;
export type apiActionPromise = (client: ApiClient) => Promise<any>;

export interface PromiseAction {
  type: ACTIONS['type'];
  // use just async types
  asyncTypes?: Array<ACTIONS['type']>;
  apiPromise?: apiActionPromise;
  pouchPromise?: actionPromise;
}

type ACTIONS =
  | AppAction
  | UserAction
  | PageAction
  | PouchAction
  | PageLoadBarAction
  | RoverViewAction
  | RedirectAction
  | SolViewAction;

export type APP_ACTIONS = ACTIONS | PromiseAction;

type _MyPromiseDispatch = <T extends APP_ACTIONS>() => Promise<T>;

interface APPThunkDispatch<S, E, A> {
  <T extends A>(action: T): T;
  <R>(asyncAction: APPThunkAction<R, S, E, A>): R;
}

type APPThunkAction<R, S, E, A> = (
  dispatch: APPThunkDispatch<S, E, A> & _MyPromiseDispatch,
  getState: () => S,
  extraArgument: E,
) => R;

// https://gist.github.com/milankorsos/ffb9d32755db0304545f92b11f0e4beb
// https://gist.github.com/seansean11/196c436988c1fdf4b22cde308c492fe5
export type Thunk<R> = ActionCreator<
  APPThunkAction<R, ApplicationState, void, APP_ACTIONS>
>;

export type MyThunkDispatch = APPThunkDispatch<
  ApplicationState,
  void,
  APP_ACTIONS
>;
export type ThunkResult<R> = APPThunkAction<
  R,
  ApplicationState,
  void,
  APP_ACTIONS
> &
  RouteThunk<ApplicationState>;
export type APP_STORE = Store<ApplicationState, APP_ACTIONS>;
export type myRedirect = (action: RedirectAction) => RedirectAction;
export const myRedirect = redirect as myRedirect;

const isAsyncAction = (action: APP_ACTIONS): action is PromiseAction =>
  'apiPromise' in action || 'pouchPromise' in action;

const isApiPromiseAction = (
  action: APP_ACTIONS,
): action is PromiseAction => 'apiPromise' in action;

const isPouchPromiseAction = (
  action: APP_ACTIONS,
): action is PouchAction => 'pouchPromise' in action;

interface AThunk<R, S, DispatchExt = {}> {
  // tslint:disable-next-line:callable-types
  (dispatch: Dispatch & AThunkDispatch<S> & DispatchExt, getState: () => S): R;
}

interface AThunkDispatch<S, DispatchExt = {}> {
  // tslint:disable-next-line:callable-types
  <R>(thunk: AThunk<R, S, DispatchExt>): R;
}

const athunk = <S, DispatchExt>() => {
  const thunkMiddleware: Middleware<
    AThunkDispatch<S, DispatchExt>,
    S,
    Dispatch & AThunkDispatch<S>
  > = api => (next: Dispatch) => <R>(action: AnyAction | AThunk<R, any>) =>
    typeof action === 'function'
      ? action(api.dispatch, api.getState)
      : next(action);

  return thunkMiddleware;
};

export {
  isAsyncAction,
  isApiPromiseAction,
  isPouchPromiseAction,
  thunkMiddleware,
  promise,
};
