import {
  Action,
  AnyAction,
  applyMiddleware,
  createStore,
  Dispatch,
  Middleware,
  MiddlewareAPI,
  Reducer,
  StoreEnhancer,
} from 'redux';
import { next } from 'redux-first-router';
import { ApplicationState } from '../modules/reducer';
import { APP_ACTIONS, isAsyncAction, MyThunkDispatch } from '../modules/types';

// declare var Worker: {
//   prototype: Worker;
//   new (stringUrl: string, options: WorkerOptions): Worker;
// };

/**
 * Logger middleware doesn't add any extra types to dispatch, just logs actions
 * and state.
 */
function logger() {
  const loggerMiddleware: Middleware = ({ getState }: MiddlewareAPI) => (
    next: Dispatch,
  ) => action => {
    console.log('will dispatch', action);

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action);

    console.log('state after dispatch', getState());

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue;
  };

  return loggerMiddleware;
}

/**
 * Promise middleware adds support for dispatching promises.
 */

type PromiseDispatch = <T extends Action>(promise: Promise<T>) => Promise<T>;

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
// const clientMiddleware = (): Middleware<PromiseDispatch> => ({
//     dispatch,
//     getState,
//   }) => (
//     next: Dispatch<APP_ACTIONS>,
//   ) => (action: APP_ACTIONS): Promise<APP_ACTIONS> | APP_ACTIONS => {
const mw = () => ({ dispatch, getState }) => next => action => next(action);
type MyPromiseDispatch = <T extends APP_ACTIONS>(
  promise: Promise<T>,
) => Promise<T>;
type _MyPromiseDispatch = <T extends APP_ACTIONS>() => Promise<T>;
const myPromiseMiddleware = (): Middleware<
  MyPromiseDispatch,
  ApplicationState
> => ({
  dispatch,
  getState,
}: MiddlewareAPI<MyThunkDispatch, ApplicationState>) => next => (
  action: APP_ACTIONS,
): Promise<any> | APP_ACTIONS => {
  // if (action instanceof Promise) {
  //   return action.then(dispatch);
  //   // return action;
  // }
  if (isAsyncAction(action)) {
    return action.pouchPromise().then(dispatch);
    // return action;
  }
  return next(action);
};

/**
 * Thunk middleware adds support for dispatching thunks.
 */

type Thunk<R, S, DispatchExt = {}> = (
  dispatch: Dispatch & ThunkDispatch<S> & DispatchExt,
  getState: () => S,
) => R;

type ThunkDispatch<S, DispatchExt = {}> = <R>(
  thunk: Thunk<R, S, DispatchExt>,
) => R;

function thunk<S, DispatchExt>() {
  const thunkMiddleware: Middleware<
    ThunkDispatch<S, DispatchExt>,
    S,
    Dispatch & ThunkDispatch<S>
  > = api => (next: Dispatch) => <R>(action: AnyAction | Thunk<R, any>) =>
    typeof action === 'function'
      ? action(api.dispatch, api.getState)
      : next(action);

  return thunkMiddleware;
}

/**
 * Middleware that expects exact state type.
 */
function customState() {
  interface State {
    field: 'string';
  }

  const customMiddleware: Middleware<{}, State> = api => (
    next: Dispatch,
  ) => action => {
    // tslint:disable-next-line:no-unused-expression
    api.getState().field;
    // typings:expect-error
    // tslint:disable-next-line:no-unused-expression
    // api.getState().wrongField;

    return next(action);
  };

  return customMiddleware;
}

/**
 * Middleware that expects custom dispatch.
 */
function customDispatch() {
  type MyAction = { type: 'INCREMENT' } | { type: 'DECREMENT' };

  // dispatch that expects action union
  type MyDispatch = Dispatch<MyAction>;

  const customDispatch: Middleware = (
    api: MiddlewareAPI<MyDispatch>,
  ) => next => action => {
    api.dispatch({ type: 'INCREMENT' });
    api.dispatch({ type: 'DECREMENT' });
    // typings:expect-error
    // api.dispatch({ type: 'UNKNOWN' });
  };
}

/**
 * Test the type of store.dispatch after applying different middleware.
 */
function apply() {
  interface State {
    someField: 'string';
  }
  const reducer: Reducer<State> = null as any;

  /**
   * logger
   */
  const storeWithLogger = createStore(reducer, applyMiddleware(logger()));
  // can only dispatch actions
  storeWithLogger.dispatch({ type: 'INCREMENT' });
  // typings:expect-error
  // storeWithLogger.dispatch(Promise.resolve({ type: 'INCREMENT' }));
  // typings:expect-error
  // storeWithLogger.dispatch('not-an-action');

  /**
   * promise
   */
  const storeWithPromise = createStore(reducer, applyMiddleware(promise()));
  // can dispatch actions and promises
  storeWithPromise.dispatch({ type: 'INCREMENT' });
  storeWithPromise.dispatch(Promise.resolve({ type: 'INCREMENT' }));
  // typings:expect-error
  // storeWithPromise.dispatch('not-an-action');
  // typings:expect-error
  // storeWithPromise.dispatch(Promise.resolve('not-an-action'));

  /**
   * promise + logger
   */
  const storeWithPromiseAndLogger = createStore(
    reducer,
    applyMiddleware(promise(), logger()),
  );
  // can dispatch actions and promises
  storeWithPromiseAndLogger.dispatch({ type: 'INCREMENT' });
  storeWithPromiseAndLogger.dispatch(Promise.resolve({ type: 'INCREMENT' }));
  // typings:expect-error
  // storeWithPromiseAndLogger.dispatch('not-an-action');
  // typings:expect-error
  // storeWithPromiseAndLogger.dispatch(Promise.resolve('not-an-action'));

  /**
   * promise + thunk
   */
  const storeWithPromiseAndThunk = createStore(
    reducer,
    applyMiddleware(promise(), thunk<State, PromiseDispatch>(), logger()),
  );
  // can dispatch actions, promises and thunks
  storeWithPromiseAndThunk.dispatch({ type: 'INCREMENT' });
  storeWithPromiseAndThunk.dispatch(Promise.resolve({ type: 'INCREMENT' }));
  storeWithPromiseAndThunk.dispatch((dispatch, getState) => {
    // tslint:disable-next-line:no-unused-expression
    // getState().someField;
    // typings:expect-error
    // getState().wrongField;
    // injected dispatch accepts actions, thunks and promises
    // dispatch({ type: 'INCREMENT' });
    // dispatch(dispatch => dispatch({ type: 'INCREMENT' }));
    // dispatch(Promise.resolve({ type: 'INCREMENT' }));
    // typings:expect-error
    // dispatch('not-an-action');
  });
  // typings:expect-error
  // storeWithPromiseAndThunk.dispatch('not-an-action');
  // typings:expect-error
  // storeWithPromiseAndThunk.dispatch(Promise.resolve('not-an-action'));

  /**
   * Test variadic signature.
   */
  const storeWithLotsOfMiddleware = createStore(
    reducer,
    applyMiddleware<PromiseDispatch>(
      promise(),
      logger(),
      logger(),
      logger(),
      logger(),
      logger(),
    ),
  );
  storeWithLotsOfMiddleware.dispatch({ type: 'INCREMENT' });
  storeWithLotsOfMiddleware.dispatch(Promise.resolve({ type: 'INCREMENT' }));
}

export { thunk, promise, PromiseDispatch };
