import React from 'react';
import universal from 'react-universal-component';

const error = () => <div className="errorGG">UNI error</div>;
const loading = () => <div className="LoadingGG">UNI LOADING</div>;
const minDelay = 0;
const loadingTransition = false;

const options = {
  error,
  loading,
  minDelay,
  loadingTransition,
};

const UniversalComponent = universal(props =>
  import(`../asyncContext/${props.page}`),
  options
);

// const setPluginEnabled = () => {
//   const weakId = require.resolveWeak('react-universal-component');
//   const universal = __webpack_require__(weakId);// eslint-disable-line
//   universal.setHasBabelPlugin();
// };
// setPluginEnabled();

export default UniversalComponent;
