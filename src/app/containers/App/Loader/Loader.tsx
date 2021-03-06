import cn from 'classnames';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import './Loader.sass';

interface Props {
  loading: boolean;
  loadEnded: boolean;
  loadError: boolean;
}

const mapStateToProps = state => ({
  loading: state.pageLoadBar.loading,
  loadEnded: state.pageLoadBar.loadEnded,
  loadError: state.pageLoadBar.loadError,
});

const LoaderComp: React.SFC<Props> = memo(
  ({ loading, loadEnded, loadError }) => {
    const globalLoadClass = cn('global_load', {
      loadError,
      loading: loading && !loadEnded,
      loadEnded: loadEnded && !loading,
    });

    const bar = (
      <div className={globalLoadClass}>
        <div className="bar" />
      </div>
    );

    return bar;
  },
);

const Loader = connect(mapStateToProps)(LoaderComp);

export { Loader };
