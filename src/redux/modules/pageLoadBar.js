export const LOADING = 'pageLoadBar/LOADING';
export const END_LOADING = 'pageLoadBar/END_LOADING';
export const RESET_LOADING = 'pageLoadBar/RESET_LOADING';
export const END_LOADING_FROM_ERROR = 'pageLoadBar/END_LOADING_FROM_ERROR';

const initialState = {
  loading: false,
  loadEnd: false,
  error: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOADING:
      return {
        ...state,
        loading: true,
        loadEnd: false
      };
    case END_LOADING:
      return {
        ...state,
        loading: false,
        loadEnd: true,
        error: false
      };
    case END_LOADING_FROM_ERROR:
      return {
        ...state,
        loading: false,
        loadEnd: false,
        error: true
      };
    case RESET_LOADING:
      return {
        ...state,
        loading: false,
        loadEnd: false,
        error: false
      };
    default:
      return state;
  }
}

export function startLoading() {
  return (dispatch, getState) => {
    if (!getState().pageLoadBar.loading) {
      dispatch({ type: LOADING });
    }
  };
}

export function endLoading(fromError = false, rewindOnError = true) {
  const resetDelay = 3000;
  const rewindDelay = 1400;

  if (fromError && rewindOnError) {
    return (dispatch, getState) => {
      if (getState().pageLoadBar.loading) {
        clearTimeout(endWithDelay);// eslint-disable-line
        const endWithDelay = setTimeout(() => {
          dispatch({ type: END_LOADING_FROM_ERROR });
        }, rewindDelay);

        clearTimeout(resetWithDelay);// eslint-disable-line
        const resetWithDelay = setTimeout(() => {
          dispatch({ type: RESET_LOADING });
        }, resetDelay);
      }
    };
  }

  return (dispatch, getState) => {
    if (getState().pageLoadBar.loading) {
      dispatch({ type: END_LOADING });

      clearTimeout(resetWithDelay);// eslint-disable-line
      const resetWithDelay = setTimeout(() => {
        dispatch({ type: RESET_LOADING });
      }, resetDelay);
    }
  };
}
