import React from 'react';
import { connect } from 'react-redux';
import universal from 'react-universal-component';

const error = () => <div className="errorGG">UNI error</div>;
const loading = () => {
  console.log('UNI LOADING');
  return <div className="LoadingGG">UNI LOADING</div>;
};

const mapStateToProps = state => ({
  page: state.page,
});

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

const InnerUniversalComponent = universal(
  (props: UniversalProps) =>
    import(/* webpackChunkName: [request] */ `../asyncContext/${props.page}`),
  universalOptions,
);

const UniversalWrapper = ({ page }) => <InnerUniversalComponent page={page} />;
const UniversalComponent = connect(mapStateToProps)(UniversalWrapper);

export default UniversalComponent;
