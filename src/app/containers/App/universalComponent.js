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

export { UniversalComponent };
