import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest, showMoreSols, showLessSols, roverMatcher } from '../../redux/modules/roverView';
import PATHS from '../../config/pathsConfig.js';
import './roverView.sass';

const asyncInfo = {
  key: 'Info',
  promise: (options) => {
    const {
      store: { dispatch, getState },
      params: { rover }
    } = options;

    const roverViewState = getState().roverView;
    if (roverViewState.loaded) {
      return 'Info';
    }

    const _rover = roverMatcher(rover) ? rover : roverViewState.defaultRover;// || getState().roverView.rover;
    return dispatch(getManifest(_rover, true)).then(() => 'Info');
  }
};

const mapStateToProps = state => ({
  roverName: state.roverView.roverName,
  minSolsShown: state.roverView.minSolsShown,
  maxSolsShown: state.roverView.maxSolsShown,
  moreSolsShown: state.roverView.moreSolsShown,
  solsCount: state.roverView.solsCount,
  missionStats: state.roverView.missionStats,
  solsToRender: state.roverView.solsToRender,
  manifestLoaded: state.roverView.loaded,
  manifestLoading: state.roverView.loading,
  initialSolCount: state.roverView.initialSolCount,
  manifestLoadError: state.roverView.error
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    Object.assign({}, { refreshManifest, showMoreSols, showLessSols }), dispatch
  );
};

@asyncConnect(
  [asyncInfo],
  mapStateToProps,
  mapDispatchToProps
)
export default class Info extends Component {

  static propTypes = {
    roverName: PropTypes.string,
    showMoreSols: PropTypes.func,
    showLessSols: PropTypes.func,
    maxSolsShown: PropTypes.bool,
    minSolsShown: PropTypes.bool,
    moreSolsShown: PropTypes.bool,
    solsCount: PropTypes.number,
    missionStats: PropTypes.object,
    solsToRender: PropTypes.array,
    manifestLoaded: PropTypes.bool,
    refreshManifest: PropTypes.func,
    manifestLoading: PropTypes.bool,
    initialSolCount: PropTypes.number,
    manifestLoadError: PropTypes.any
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

    const { solsToRender } = this.props;

    if (!solsToRender) {
      return;
    }

    const sols = solsToRender.map((sol, index) => {
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
    const { refreshManifest } = this.props;// eslint-disable-line
    const offline = !!e.target.dataset.offline;
    refreshManifest('Spirit', offline);
  }

  handleShowMoreSols() {
    const { showMoreSols } = this.props;// eslint-disable-line
    showMoreSols();
  }

  handleShowLessSols() {
    const { showLessSols } = this.props;// eslint-disable-line
    showLessSols();
  }

  render() {

    const {
      solsCount,
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
        <p><Link to={`/${PATHS.HOME}`}>go home</Link></p>

        <div>
          <button onClick={this.handleRefreshManifestRequest}>refresh</button>
          &nbsp;
          <button onClick={this.handleRefreshManifestRequest} data-offline>refresh (offline)</button>
          &nbsp;
          {!minSolsShown && <button onClick={this.handleShowLessSols}>show less</button>}
          &nbsp;
          {!maxSolsShown && <button onClick={this.handleShowMoreSols}>show more</button>}
          &nbsp;
          {solsCount && <span>currently shown sols: {`${solsCount}`}</span>}
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
            {!minSolsShown && <button onClick={this.handleShowLessSols}>show less sols</button>}
            &nbsp;
            {!maxSolsShown && <button onClick={this.handleShowMoreSols}>show more sols</button>}
          </div>
        }
      </div>);
  }
}
