import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest, updateCurrentSolShowCount } from '../../redux/modules/marsRovers';
import './roverView.sass';

const asyncInfo = {
  key: 'Info',
  promise: (options) => {
    const {
      store: { dispatch, getState },
      params: { rover }
    } = options;

    if (getState().marsRovers.loaded) {
      return 'Info';
    }

    const _rover = getState().marsRovers.rover || rover;
    return dispatch(getManifest(_rover, true)).then(() => 'Info');
  }
};

const mapStateToProps = state => ({
  manifestLoaded: state.marsRovers.loaded,
  manifestLoading: state.marsRovers.loading,
  marsRoverManifest: state.marsRovers.data,
  manifestLoadError: state.marsRovers.error,
  solShowCount: state.marsRovers.solShowCount,
  showMoreSols: state.marsRovers.showMoreSols,
  maxSolsShown: state.marsRovers.maxSolsShown,
  currentSolShowCount: state.marsRovers.currentSolShowCount
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    Object.assign({}, { refreshManifest, updateCurrentSolShowCount }), dispatch
  );
};

@asyncConnect(
  [asyncInfo],
  mapStateToProps,
  mapDispatchToProps
)
export default class Info extends Component {

  static propTypes = {
    manifestLoaded: PropTypes.bool,
    refreshManifest: PropTypes.func,
    manifestLoading: PropTypes.bool,
    marsRoverManifest: PropTypes.object,
    manifestLoadError: PropTypes.any,
    maxSolsShown: PropTypes.bool,
    showMoreSols: PropTypes.bool,
    solShowCount: PropTypes.number,
    currentSolShowCount: PropTypes.number,
    updateCurrentSolShowCount: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.handleShowLessSols = ::this.handleShowLessSols;
    this.handleShowMoreSols = ::this.handleShowMoreSols;
    this.handleRefreshManifestRequest = ::this.handleRefreshManifestRequest;
  }

  renderRoverMissionStats() {
    const { marsRoverManifest } = this.props;
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

    const { solShowCount, currentSolShowCount, showMoreSols, marsRoverManifest } = this.props;

    if (!marsRoverManifest) {
      return;
    }

    const solsLength = marsRoverManifest.photo_manifest.length;
    let showCount = solShowCount;

    if (showMoreSols) {
      showCount = currentSolShowCount;
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

  handleRefreshManifestRequest(e) {
    const { refreshManifest, solShowCount, currentSolShowCount } = this.props;// eslint-disable-line
    const offline = !!e.target.dataset.offline;
    refreshManifest('Spirit', offline, solShowCount, currentSolShowCount);
  }

  handleShowMoreSols() {
    const { updateCurrentSolShowCount, solShowCount, currentSolShowCount } = this.props;// eslint-disable-line
    updateCurrentSolShowCount(currentSolShowCount + solShowCount);
  }

  handleShowLessSols() {
    const { updateCurrentSolShowCount, solShowCount, currentSolShowCount } = this.props;// eslint-disable-line
    updateCurrentSolShowCount(currentSolShowCount - solShowCount);
  }

  render() {

    const {
      maxSolsShown,
      manifestLoaded,
      manifestLoading,
      manifestLoadError
    } = this.props;

    const solsCards = this.renderSolsCards();
    const roverMissionStats = this.renderRoverMissionStats();

    return (
      <div className="Page">
        <h1>
          RoverView
          &nbsp;
        </h1>
        <p><Link to="/home">go home</Link></p>

        <div>
          <button onClick={this.handleRefreshManifestRequest}>refresh</button>
          &nbsp;
          <button onClick={this.handleRefreshManifestRequest} data-offline>refresh (offline)</button>
          &nbsp;
          {maxSolsShown ?
              <button onClick={this.handleShowLessSols}>show less</button>
            :
              <button onClick={this.handleShowMoreSols}>show more</button>
          }
        </div>

        {manifestLoading && !manifestLoadError &&
          <div><h1>loading ...</h1></div>
        }

        {manifestLoadError &&
          <div>
            {JSON.stringify(manifestLoadError, 0, 2)}
          </div>
        }

        {manifestLoaded && !manifestLoadError &&
          <div>
            {roverMissionStats}
            {solsCards}
            {maxSolsShown ?
                <button onClick={this.handleShowLessSols}>show less</button>
              :
                <button onClick={this.handleShowMoreSols}>show more</button>
            }
          </div>
        }
      </div>);
  }
}
