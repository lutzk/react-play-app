const LOADING = 'pageLoadBar/LOADING';
const END_LOADING = 'pageLoadBar/END_LOADING';
const RESET_LOADING = 'pageLoadBar/RESET_LOADING';
const END_LOADING_FROM_ERROR = 'pageLoadBar/END_LOADING_FROM_ERROR';

const initialState = {
  loading: false,
  loadEnd: false,
  error: false,
};

function pageLoadBar(state = initialState, action = {}) {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loading: true,
        loadEnd: false,
      };
    case END_LOADING:
      return {
        ...state,
        loading: false,
        loadEnd: true,
        error: false,
      };
    case END_LOADING_FROM_ERROR:
      return {
        ...state,
        loading: false,
        loadEnd: false,
        error: true,
      };
    case RESET_LOADING:
      return {
        ...state,
        loading: false,
        loadEnd: false,
        error: false,
      };
    default:
      return state;
  }
}

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
        clearTimeout(endWithDelay);// eslint-disable-line
        endWithDelay = setTimeout(() => {
          dispatch({ type: END_LOADING_FROM_ERROR });
        }, rewindDelay);

        clearTimeout(resetWithDelay);// eslint-disable-line
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
      clearTimeout(resetWithDelay);// eslint-disable-line
      resetWithDelay = setTimeout(() => {
        dispatch({ type: RESET_LOADING });
      }, resetDelay);
    }
  };
}

export {
  endLoading,
  pageLoadBar,
  startLoading,
  LOADING,
  END_LOADING,
  RESET_LOADING,
  END_LOADING_FROM_ERROR,
};
