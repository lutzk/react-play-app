import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest } from '../../redux/modules/marsRovers';

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    Object.assign({}, { refreshManifest }), dispatch
  );
};

@asyncConnect([{
  key: 'Info',
  promise: (options) => {
    const {
      store: { dispatch, getState },
      params: { rover }
    } = options;

    if (getState().marsRovers.loaded) {
      return;
    }

    const _rover = getState().marsRovers.rover || rover;
    // const promises = [];
    // promises.push(dispatch(getManifest(_rover, true)));
    // return Promise.all(promises);
    return dispatch(getManifest(_rover, true)); // eslint-disable-line
  }
}],
state => ({
  marsRoverManifest: state.marsRovers.data,
  manifestLoading: state.marsRovers.loading,
  manifestLoaded: state.marsRovers.loaded,
  manifestLoadError: state.marsRovers.error
}),
mapDispatchToProps)
export default class Info extends Component {

  static propTypes = {
    marsRoverManifest: PropTypes.object,
    manifestLoading: PropTypes.bool,
    manifestLoaded: PropTypes.bool,
    manifestLoadError: PropTypes.any,
    refreshManifest: PropTypes.func
  }

  /* eslint-disable */
  getRoverMetaData(manifest) {
    if (!manifest) return;

    const metaKeys = ['name', 'landing_date', 'launch_date', 'status', 'max_sol', 'max_date', 'total_photos'];
    const content = metaKeys.map((key, index) => {
      return (<div key={index}>{key}:&nbsp;{manifest.photo_manifest[key]}</div>);
    });

    return (
      <div className="roverMetaData">
        {content}
      </div>);
  }
  /* eslint-enable */

  /* eslint-disable */
  getRoverPhotoData(manifest) {
    if (!manifest) return;

    const content = manifest.photo_manifest.photos.map((photo, index) => {
      return (
        <div key={index}>
          <div>sol:&nbsp;{photo.sol}</div>
          <div>total_photos:&nbsp;{photo.total_photos}</div>
          {photo.cameras.map((cam, i) => {
            return (<span key={i}>cam:&nbsp;{cam}&nbsp;</span>);
          })
        }
      </div>);
    });

    return (
      <div className="roverPhotoDataData">
        {content}
      </div>);
  }
  /* eslint-enable */

  render() {

    const { marsRoverManifest, manifestLoading, manifestLoaded, manifestLoadError } = this.props;
    const roverMetaData = this.getRoverMetaData(marsRoverManifest);
    const roverPhotoData = this.getRoverPhotoData(marsRoverManifest);

    return (
      <div>
        <h1>
          info
          &nbsp;
          <Link to="/home">go home</Link>
        </h1>
        {manifestLoading &&
          <div><h1>loading ...</h1></div>
        }
        {manifestLoadError && <div>
          {JSON.stringify(manifestLoadError, 0, 2)}
          &bsp;
          <button onClick={() => this.props.refreshManifest('Spirit', true)}>refresh</button>
        </div>}
        {manifestLoaded && !manifestLoadError &&
          <div>
            {roverMetaData}
            {roverPhotoData}
          </div>
        }
      </div>);
  }
}
