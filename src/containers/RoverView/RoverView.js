import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest, showMoreSols, showLessSols, roverMatcher, sortSols } from '../../redux/modules/roverView';
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
  solSortSettings: state.roverView.solSortSettings,
  roverName: state.roverView.roverName,
  solsCount: state.roverView.solsCount,
  missionStats: state.roverView.missionStats,
  solsToRender: state.roverView.solsToRender,
  minSolsShown: state.roverView.minSolsShown,
  maxSolsShown: state.roverView.maxSolsShown,
  moreSolsShown: state.roverView.moreSolsShown,
  manifestLoaded: state.roverView.loaded,
  manifestLoading: state.roverView.loading,
  initialSolCount: state.roverView.initialSolCount,
  manifestLoadError: state.roverView.error,
});

const mapDispatchToProps = dispatch => bindActionCreators(
  Object.assign({}, { refreshManifest, showMoreSols, showLessSols, sortSols }), dispatch
);

@asyncConnect(
  [asyncInfo],
  mapStateToProps,
  mapDispatchToProps
)
export default class Info extends Component {

  static propTypes = {
    params: PropTypes.object,
    sortSols: PropTypes.func,
    solsCount: PropTypes.number,
    roverName: PropTypes.string,
    showMoreSols: PropTypes.func,
    showLessSols: PropTypes.func,
    maxSolsShown: PropTypes.bool,
    minSolsShown: PropTypes.bool,
    missionStats: PropTypes.object,
    solsToRender: PropTypes.array,
    moreSolsShown: PropTypes.bool,
    manifestLoaded: PropTypes.bool,
    refreshManifest: PropTypes.func,
    manifestLoading: PropTypes.bool,
    initialSolCount: PropTypes.number,
    manifestLoadError: PropTypes.any,
    solSortSettings: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.handleSortSols = ::this.handleSortSols;
    this.handleShowLessSols = ::this.handleShowLessSols;
    this.handleShowMoreSols = ::this.handleShowMoreSols;
    this.handleRefreshManifestRequest = ::this.handleRefreshManifestRequest;
  }

  componentDidMount() {
    if (!this.props.params.rover && this.props.roverName) {
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

  handleSortSols(e) {
    const fields = e.currentTarget.dataset.sortfield ?
      [e.currentTarget.dataset.sortfield] : this.props.solSortSettings.fields;

    const fieldsOrders = e.currentTarget.dataset.sortorder ?
      [e.currentTarget.dataset.sortorder] : this.props.solSortSettings.fieldsOrders;

    return this.props.sortSols({ fields, fieldsOrders });
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
      sols: this.props.solsToRender,
      rover: this.props.roverName.toLowerCase(),
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

    const sortPane = (
      <div>
        <button onClick={this.handleSortSols}>sort</button>
        &nbsp;
        <button data-sortorder="asc" onClick={this.handleSortSols}>sort asc</button>
        &nbsp;
        <button data-sortorder="desc" onClick={this.handleSortSols}>sort desc</button>
        &nbsp;
        <button data-sortfield="cameras" onClick={this.handleSortSols}>sort by cams</button>
        &nbsp;
        <button data-sortfield="total_photos" onClick={this.handleSortSols}>sort by photos</button>
        &nbsp;
      </div>
    );
    return (
      <div className="Page">

        <h1>RoverView</h1>
        <p><Link to={`/${PATHS.HOME}`}>go home</Link></p>

        <div>
          {buttonPane}
          &nbsp;
          {solsCount && <span>currently shown sols: {`${solsCount}`}</span>}
        </div>
        {sortPane}
        {manifestLoading && !manifestLoadError &&
          <div className="manifestLoading"><h3>loading ...</h3></div>
        }

        {manifestLoadError &&
          <div className="error">
            something went wrong loading rover manifest
          </div>
        }

        {manifestLoaded && !manifestLoadError &&
          <div>
            <RoverMissionStats {...missionStatsProps} />
            <RoverMissionSols {...missionSolsProps} />
            {sortPane}
            {buttonPane}
          </div>
        }
      </div>);
  }
}
