import {
  Action,
  ActionCreator,
  AnyAction,
  Dispatch,
  Middleware,
  Store,
} from 'redux';
import { redirect, RouteThunk } from 'redux-first-router';
// import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { ApiClient } from '../../../helpers/ApiClient';
import { PouchAction } from '../../../redux-pouchdb-plus/src';
import { RedirectAction } from '../routing/nav';
import { AppAction } from './app';
import { PageAction } from './page';
import { PageLoadBarAction } from './pageLoadBar';
import { ApplicationState } from './reducer';
import { RoverViewAction } from './roverView';
import { SolViewAction } from './solView';
import { UserAction } from './user';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Omit1<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type actionPromise = () => Promise<any>;
// type api response
type apiActionPromise = (client: ApiClient) => Promise<any>;
type PromiseDispatch = <T extends Action>(promise: Promise<T>) => Promise<T>;
interface PromiseAction {
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

type APP_ACTIONS = ACTIONS | PromiseAction;

// type abc = Extract<>;
type abcd = Exclude<PageLoadBarAction, PromiseAction>;
// type abcde = Omit<ACTIONS, APP_ACTIONS>;
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
type Thunk<R> = ActionCreator<
  APPThunkAction<R, ApplicationState, void, APP_ACTIONS>
>;

type MyThunkDispatch = APPThunkDispatch<ApplicationState, void, APP_ACTIONS>;
type ThunkResult<R> = APPThunkAction<R, ApplicationState, void, APP_ACTIONS> &
  RouteThunk<ApplicationState>;
type APP_STORE = Store<ApplicationState, APP_ACTIONS>;
type myRedirect = (action: RedirectAction) => RedirectAction;
const myRedirect = redirect as myRedirect;
// RouteThunk <ApplicationState> = (dispatch: MyThunkDispatch)
const isAsyncAction = (action: APP_ACTIONS): action is PromiseAction =>
  'apiPromise' in action || 'pouchPromise' in action;

const isApiPromiseAction = (action: APP_ACTIONS): action is PromiseAction =>
  'apiPromise' in action;

const isPouchPromiseAction = (action: APP_ACTIONS): action is PouchAction =>
  'pouchPromise' in action;

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
  APP_ACTIONS,
  Thunk,
  APP_STORE,
  MyThunkDispatch,
  ThunkResult,
  PromiseAction,
  isAsyncAction,
  apiActionPromise,
  // ApiPromiseAction,
  // PouchPromiseAction,
  isApiPromiseAction,
  isPouchPromiseAction,
  PromiseDispatch,
  myRedirect,
};
