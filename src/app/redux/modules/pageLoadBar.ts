import produce from 'immer';
import { Reducer } from 'redux';
import { Thunk, ThunkResult } from '../store/types';

export enum PAGE_ACTIONS {
  LOADING = 'pageLoadBar/LOADING',
  END_LOADING = 'pageLoadBar/END_LOADING',
  RESET_LOADING = 'pageLoadBar/RESET_LOADING',
  END_LOADING_FROM_ERROR = 'pageLoadBar/END_LOADING_FROM_ERROR',
}

export interface PageLoadBarState {
  loading?: boolean;
  loadEnd?: boolean;
  error?: boolean;
}

export interface PageLoadBarAction extends PageLoadBarState {
  type: PAGE_ACTIONS;
}

const initialState: PageLoadBarState = {
  loading: false,
  loadEnd: false,
  error: false,
};

const pageLoadBar: Reducer<PageLoadBarState> = (
  state = initialState,
  action: PageLoadBarAction,
) =>
  produce(state, draft => {
    switch (action.type) {
      case PAGE_ACTIONS.LOADING:
        draft.loading = true;
        draft.loadEnd = false;
        return;

      case PAGE_ACTIONS.END_LOADING:
        draft.loading = false;
        draft.loadEnd = true;
        draft.error = false;
        return;

      case PAGE_ACTIONS.END_LOADING_FROM_ERROR:
        draft.loading = false;
        draft.loadEnd = false;
        draft.error = true;
        return;

      case PAGE_ACTIONS.RESET_LOADING:
        draft = initialState;
        return;
    }
  });

const startLoading: Thunk<PageLoadBarAction | void> = _ => (
  dispatch,
  getState,
) => {
  if (!getState().pageLoadBar.loading) {
    return dispatch({ type: PAGE_ACTIONS.LOADING });
  }
};

const endLoading: Thunk<PageLoadBarAction | void> = (
  fromError = false,
  rewindOnError = true,
) => (dispatch, getState) => {
  let endWithDelay;
  let resetWithDelay;
  const resetDelay = 3000;
  const rewindDelay = 1400;
  const state = getState().pageLoadBar;
  if (fromError && rewindOnError) {
    if (state.loading && !state.loadEnd) {
      clearTimeout(endWithDelay);
      endWithDelay = setTimeout(() => {
        dispatch({ type: PAGE_ACTIONS.END_LOADING_FROM_ERROR });
      }, rewindDelay);

      clearTimeout(resetWithDelay);
      resetWithDelay = setTimeout(() => {
        dispatch({ type: PAGE_ACTIONS.RESET_LOADING });
      }, resetDelay);
    }
  }

  if (state.loading && !state.loadEnd) {
    dispatch({ type: PAGE_ACTIONS.END_LOADING });
    clearTimeout(resetWithDelay);
    resetWithDelay = setTimeout(() => {
      return dispatch({ type: PAGE_ACTIONS.RESET_LOADING });
    }, resetDelay);
  }
};

export {
  // PageLoadBarState,
  // PageLoadBarAction,
  endLoading,
  pageLoadBar,
  startLoading,
  // PAGE_ACTIONS,
};
