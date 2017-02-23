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
  manifestLoadError: state.marsRovers.error,
  initialSolCount: state.marsRovers.initialSolCount,
  showMoreSols: state.marsRovers.showMoreSols,
  minSolsShown: state.marsRovers.minSolsShown,
  maxSolsShown: state.marsRovers.maxSolsShown,
  currentSolShowCount: state.marsRovers.currentSolShowCount,
  roverName: state.marsRovers.roverName,
  missionStats: state.marsRovers.missionStats,
  missionSolsToRender: state.marsRovers.missionSolsToRender
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
    manifestLoadError: PropTypes.any,
    maxSolsShown: PropTypes.bool,
    minSolsShown: PropTypes.bool,
    showMoreSols: PropTypes.bool,
    initialSolCount: PropTypes.number,
    currentSolShowCount: PropTypes.number,
    updateCurrentSolShowCount: PropTypes.func,
    roverName: PropTypes.string,
    missionStats: PropTypes.object,
    missionSolsToRender: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.handleShowLessSols = ::this.handleShowLessSols;
    this.handleShowMoreSols = ::this.handleShowMoreSols;
    this.handleRefreshManifestRequest = ::this.handleRefreshManifestRequest;
  }

  renderRoverMissionStats() {
    const { missionStats, roverName } = this.props;
    if (!missionStats) return;

    const stats = Object.keys(missionStats).map((stat, index) => {
      return (
        <div key={index} className="roverMissionStatsCard">
          {stat}:&nbsp;{missionStats[stat]}
        </div>
      );
    });

    return (// eslint-disable-line
      <div className="roverMissionStatsWrap">
        <h3 className="roverName">{roverName}</h3>
        <div className="roverAvatar">
          __roverAvatar__
        </div>
        <div className="roverMissionStats">{stats}</div>
      </div>);
  }

  renderSolsCards() {

    const { missionSolsToRender } = this.props;

    if (!missionSolsToRender) {
      return;
    }

    const sols = missionSolsToRender.map((sol, index) => {
      return (
        <div key={index} className="solCard">
          <div>
            <h4>sol:&nbsp;{sol.sol}</h4>
          </div>
          <div>
            total_photos:&nbsp;{sol.total_photos}
          </div>
          <div>
            cams:&nbsp;
            {sol.cameras.map((cam, i) => {
              return (<span key={i}>{cam}&nbsp;</span>);
            })}
          </div>
        </div>);
    });

    return (// eslint-disable-line
      <div className="roverPhotoDataData">
        {sols}
      </div>);
  }

  handleRefreshManifestRequest(e) {
    const { refreshManifest, initialSolCount, currentSolShowCount } = this.props;// eslint-disable-line
    const offline = !!e.target.dataset.offline;
    refreshManifest('Spirit', offline, initialSolCount, currentSolShowCount);
  }

  handleShowMoreSols() {
    const { updateCurrentSolShowCount, initialSolCount, currentSolShowCount } = this.props;// eslint-disable-line
    updateCurrentSolShowCount(currentSolShowCount + initialSolCount);
  }

  handleShowLessSols() {
    const { updateCurrentSolShowCount, initialSolCount, currentSolShowCount } = this.props;// eslint-disable-line
    updateCurrentSolShowCount(currentSolShowCount - initialSolCount);
  }

  render() {

    const {
      minSolsShown,
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
          {!minSolsShown && <button onClick={this.handleShowLessSols}>show less</button>}
          &nbsp;
          {!maxSolsShown && <button onClick={this.handleShowMoreSols}>show more</button>}
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
            {!minSolsShown && <button onClick={this.handleShowLessSols}>show less</button>}
            &nbsp;
            {!maxSolsShown && <button onClick={this.handleShowMoreSols}>show more</button>}
            }
          </div>
        }
      </div>);
  }
}
