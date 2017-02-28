import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest, showMoreSols, showLessSols, roverMatcher } from '../../redux/modules/roverView';
import PATHS from '../../config/pathsConfig.js';
import RoverMissionStats from './RoverMissionStats';
import RoverMissionSols from './RoverMissionSols';
import './roverView.sass';

const asyncInfo = {
  key: 'Info',
  promise: (options) => {
    const {
      store: { dispatch, getState },
      params: { rover },
    } = options;
    const roverViewState = getState().roverView;
    if (roverViewState.loaded) {
      return 'Info';
    }

    const _rover = roverMatcher(rover) ? rover : roverViewState.defaultRover;// || getState().roverView.rover;
    return dispatch(getManifest(_rover, true)).then(() => 'Info');
  },
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
  manifestLoadError: state.roverView.error,
});

const mapDispatchToProps = dispatch => bindActionCreators(
  Object.assign({}, { refreshManifest, showMoreSols, showLessSols, push }), dispatch
);

@asyncConnect(
  [asyncInfo],
  mapStateToProps,
  mapDispatchToProps
)
export default class Info extends Component {

  static propTypes = {
    push: PropTypes.func,
    params: PropTypes.object,
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
    manifestLoadError: PropTypes.any,
  }

  constructor(props) {
    super(props);

    this.handleShowLessSols = ::this.handleShowLessSols;
    this.handleShowMoreSols = ::this.handleShowMoreSols;
    this.handleRefreshManifestRequest = ::this.handleRefreshManifestRequest;
  }

  componentDidMount() {
    if (!this.props.params.rover) {
      window.history.pushState(null, '', `${window.location.pathname}/${this.props.roverName}`);
    }
  }

  handleRefreshManifestRequest(e) {
    const offline = !!e.target.dataset.offline;
    return this.props.refreshManifest('Spirit', offline);
  }

  handleShowMoreSols() {
    return this.props.showMoreSols();
  }

  handleShowLessSols() {
    return this.props.showLessSols();
  }

  render() {

    const {
      solsCount,
      minSolsShown,
      maxSolsShown,
      manifestLoaded,
      manifestLoading,
      manifestLoadError,
    } = this.props;

    const missionStatsProps = {
      roverName: this.props.roverName,
      missionStats: this.props.missionStats,
    };

    const missionSolsProps = {
      push: this.props.push,
      sols: this.props.solsToRender,
    };

    const buttonPane = (
      <div>
        <button onClick={this.handleRefreshManifestRequest}>refresh</button>
        &nbsp;
        <button onClick={this.handleRefreshManifestRequest} data-offline>refresh (offline)</button>
        {!minSolsShown && <button onClick={this.handleShowLessSols}>show less</button>}
        &nbsp;
        {!maxSolsShown && <button onClick={this.handleShowMoreSols}>show more</button>}
      </div>);
    return (
      <div className="Page">

        <h1>RoverView</h1>
        <p><Link to={`/${PATHS.HOME}`}>go home</Link></p>

        <div>
          {buttonPane}
          &nbsp;
          {solsCount && <span>currently shown sols: {`${solsCount}`}</span>}
        </div>

        {manifestLoading && !manifestLoadError &&
          <div className="manifestLoading"><h3>loading ...</h3></div>
        }

        {manifestLoadError &&
          <div className="error">
            {JSON.stringify(manifestLoadError, 0, 2)}
          </div>
        }

        {manifestLoaded && !manifestLoadError &&
          <div>
            <RoverMissionStats {...missionStatsProps} />
            <RoverMissionSols {...missionSolsProps} />
            {buttonPane}
          </div>
        }
      </div>);
  }
}
