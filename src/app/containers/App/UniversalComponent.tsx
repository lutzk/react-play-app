import React from 'react';
import universal from 'react-universal-component';

const error = () => <div className="errorGG">UNI error</div>;
const loading = () => {
  console.log('UNI LOADING');
  return <div className="LoadingGG">UNI LOADING</div>;
};

interface UniversalProps {
  page: string;
}

const universalOptions = {
  error,
  loading,
  minDelay: 0,
  loadingTransition: false,
  ignoreBabelRename: true,
  chunkName: data => data.page,
};
const UniversalComponent = universal(
  (props: UniversalProps) =>
    import(/* webpackChunkName: [request] */ `../asyncContext/${props.page}`),
  universalOptions,
);

export default UniversalComponent;
