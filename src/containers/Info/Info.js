import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest, updateCurrentSolShowCount } from '../../redux/modules/marsRovers';
import './roverView.sass';

const mapStateToProps = state => ({
  marsRoverManifest: state.marsRovers.data,
  manifestLoading: state.marsRovers.loading,
  manifestLoaded: state.marsRovers.loaded,
  manifestLoadError: state.marsRovers.error,
  solShowCount: state.marsRovers.solShowCount,
  currentSolShowCount: state.marsRovers.currentSolShowCount,
  showMoreSols: state.marsRovers.showMoreSols
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    Object.assign({}, { refreshManifest, updateCurrentSolShowCount }), dispatch
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
      console.log('allredy loaded');
      return Promise.resolve(true);
    }

    const _rover = getState().marsRovers.rover || rover;
    // const promises = [];
    // promises.push(dispatch(getManifest(_rover, true)));
    // return Promise.all(promises);
    return dispatch(getManifest(_rover, true));
  }
}],
mapStateToProps,
mapDispatchToProps)
export default class Info extends Component {

  static propTypes = {
    marsRoverManifest: PropTypes.object,
    manifestLoading: PropTypes.bool,
    manifestLoaded: PropTypes.bool,
    manifestLoadError: PropTypes.any,
    refreshManifest: PropTypes.func,
    solShowCount: PropTypes.number,
    currentSolShowCount: PropTypes.number,
    showMoreSols: PropTypes.bool,
    updateCurrentSolShowCount: PropTypes.func
  }

  renderRoverMissionStats() {
    const { marsRoverManifest } = this.props;// eslint-disable-line
    if (!marsRoverManifest) return;

    const metaKeys = ['landing_date', 'launch_date', 'status', 'max_sol', 'max_date', 'total_photos'];
    const content = metaKeys.map((key, index) => {
      return (
        <div
          key={index}
          className="roverMissionStatsCard">
          {key}:&nbsp;{marsRoverManifest.photo_manifest[key]}
        </div>);
    });

    return (// eslint-disable-line
      <div className="roverMissionStatsWrap">
        <h3 className="roverName">{marsRoverManifest.photo_manifest.name}</h3>
        <div className="roverAvatar">
          __roverAvatar__
        </div>
        <div className="roverMissionStats">{content}</div>
      </div>);
  }

  renderSolsCards() {
    const { solShowCount, currentSolShowCount, showMoreSols, marsRoverManifest } = this.props;// eslint-disable-line
    if (!marsRoverManifest) return;
    const solsLength = marsRoverManifest.photo_manifest.max_sol;
    let showCount = solShowCount;

    if (showMoreSols) {
      showCount += currentSolShowCount;
      showCount = showCount > solsLength ? solsLength : showCount;
    }

    const content = marsRoverManifest.photo_manifest.photos.map((photo, index) => {
      if (index > showCount) {
        return false;
      }

      return (
        <div key={index} className="solCard">
          <div><h4>sol:&nbsp;{photo.sol}</h4></div>
          <div>total_photos:&nbsp;{photo.total_photos}</div>
          <div>
            cams:&nbsp;
            {photo.cameras.map((cam, i) => {
              return (<span key={i}>{cam}&nbsp;</span>);
            })}
          </div>
        </div>);
    });

    return (// eslint-disable-line
      <div className="roverPhotoDataData">
        {content}
      </div>);
  }

  constructor(props) {
    super(props);
    this.handleShowMoreSols = ::this.handleShowMoreSols;
    this.handleRefreshManifestRequest = ::this.handleRefreshManifestRequest;
  }

  handleRefreshManifestRequest(e) {
    const { refreshManifest, solShowCount, currentSolShowCount } = this.props;// eslint-disable-line
    const offline = !!e.target.dataset.offline;
    refreshManifest('Spirit', offline, solShowCount, currentSolShowCount);
  }

  handleShowMoreSols() {
    const { updateCurrentSolShowCount, solShowCount, currentSolShowCount } = this.props;// eslint-disable-line
    updateCurrentSolShowCount(currentSolShowCount + solShowCount);
  }

  render() {

    const {
      manifestLoading,
      manifestLoaded,
      manifestLoadError
    } = this.props;

    const roverMissionStats = this.renderRoverMissionStats();
    const solsCards = this.renderSolsCards();

    return (
      <div className="Page">
        <h1>
          info
          &nbsp;
          <Link to="/home">go home</Link>
        </h1>
        {manifestLoading &&
          <div><h1>loading ...</h1></div>
        }
        {manifestLoadError &&
          <div>
            {JSON.stringify(manifestLoadError, 0, 2)}
            &nbsp;
            <button onClick={this.handleRefreshManifestRequest}>refresh</button>
            &nbsp;
            <button onClick={this.handleRefreshManifestRequest} data-offline>refresh (offline)</button>
            &nbsp;
            <button onClick={this.handleShowMoreSols}>show more</button>
          </div>
        }
        {manifestLoaded && !manifestLoadError &&
          <div>
            <button onClick={this.handleRefreshManifestRequest}>refresh</button>
            &nbsp;
            <button onClick={this.handleRefreshManifestRequest} data-offline>refresh (offline)</button>
            &nbsp;
            <button onClick={this.handleShowMoreSols}>show more</button>
            {roverMissionStats}
            {solsCards}
            <button onClick={this.handleShowMoreSols}>show more</button>
          </div>
        }
      </div>);
  }
}
