import produce from 'immer';
import { AnyAction, Reducer } from 'redux';

const LOADING = 'pageLoadBar/LOADING';
const END_LOADING = 'pageLoadBar/END_LOADING';
const RESET_LOADING = 'pageLoadBar/RESET_LOADING';
const END_LOADING_FROM_ERROR = 'pageLoadBar/END_LOADING_FROM_ERROR';

interface PageLoadBarState {
  loading?: boolean;
  loadEnd?: boolean;
  error?: boolean;
}

interface PageLoadBarAction extends AnyAction, PageLoadBarState {
  type: string;
}

const initialState: PageLoadBarState = {
  loading: false,
  loadEnd: false,
  error: false,
};

// produce(
//   (draft, action) => {
//       switch (action.type) {
//           case CASE_JO:
//               ...
//       }
//   },
//   initialState
// )

const pageLoadBar: Reducer<PageLoadBarState> = (
  state = initialState,
  action: PageLoadBarAction,
) =>
  produce(state, draft => {
    switch (action.type) {
      case LOADING:
        draft.loading = true;
        draft.loadEnd = false;
        return;

      case END_LOADING:
        draft.loading = false;
        draft.loadEnd = true;
        draft.error = false;
        return;

      case END_LOADING_FROM_ERROR:
        draft.loading = false;
        draft.loadEnd = false;
        draft.error = true;
        return;

      case RESET_LOADING:
        draft = initialState;
        return;
    }
  });

function startLoading() {
  return (dispatch, getState) => {
    if (!getState().pageLoadBar.loading) {
      dispatch({ type: LOADING });
    }
  };
}

function endLoading(fromError = false, rewindOnError = true) {
  const resetDelay = 3000;
  const rewindDelay = 1400;

  if (fromError && rewindOnError) {
    return (dispatch, getState) => {
      const state = getState().pageLoadBar;
      let endWithDelay;
      let resetWithDelay;
      if (state.loading && !state.loadEnd) {
        clearTimeout(endWithDelay);
        endWithDelay = setTimeout(() => {
          dispatch({ type: END_LOADING_FROM_ERROR });
        }, rewindDelay);

        clearTimeout(resetWithDelay);
        resetWithDelay = setTimeout(() => {
          dispatch({ type: RESET_LOADING });
        }, resetDelay);
      }
    };
  }

  return (dispatch, getState) => {
    const state = getState().pageLoadBar;
    let resetWithDelay;
    if (state.loading && !state.loadEnd) {
      dispatch({ type: END_LOADING });
      clearTimeout(resetWithDelay);
      resetWithDelay = setTimeout(() => {
        dispatch({ type: RESET_LOADING });
      }, resetDelay);
    }
  };
}

export {
  PageLoadBarState,
  PageLoadBarAction,
  endLoading,
  pageLoadBar,
  startLoading,
  LOADING,
  END_LOADING,
  RESET_LOADING,
  END_LOADING_FROM_ERROR,
};
