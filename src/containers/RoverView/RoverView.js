import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest, showMore, showLess, roverMatcher, updateList, updateFilter } from '../../redux/modules/roverView';
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
  sorts: state.roverView.sorts,
  filter: state.roverView.filter,
  roverName: state.roverView.roverName,
  count: state.roverView.count,
  missionStats: state.roverView.missionStats,
  solsToRender: state.roverView.listToRender,
  minShown: state.roverView.minShown,
  maxShown: state.roverView.maxShown,
  moreShown: state.roverView.moreShown,
  manifestLoaded: state.roverView.loaded,
  manifestLoading: state.roverView.loading,
  initialSolCount: state.roverView.initialCount,
  manifestLoadError: state.roverView.error,
});

const mapDispatchToProps = dispatch => bindActionCreators(
  Object.assign({}, { refreshManifest, showMore, showLess, updateList, updateFilter }), dispatch
);

@asyncConnect(
  [asyncInfo],
  mapStateToProps,
  mapDispatchToProps
)
export default class RoverView extends Component {

  static propTypes = {
    params: PropTypes.object,
    updateList: PropTypes.func,
    count: PropTypes.number,
    roverName: PropTypes.string,
    showMore: PropTypes.func,
    showLess: PropTypes.func,
    maxShown: PropTypes.bool,
    minShown: PropTypes.bool,
    missionStats: PropTypes.object,
    solsToRender: PropTypes.array,
    moreShown: PropTypes.bool,
    manifestLoaded: PropTypes.bool,
    refreshManifest: PropTypes.func,
    manifestLoading: PropTypes.bool,
    initialSolCount: PropTypes.number,
    manifestLoadError: PropTypes.any,
    sorts: PropTypes.object,
    updateFilter: PropTypes.func,
    filter: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.handleSort = ::this.handleSort;
    this.handleShowLessSols = ::this.handleShowLessSols;
    this.handleShowMoreSols = ::this.handleShowMoreSols;
    this.handleUpdateFilter = ::this.handleUpdateFilter;
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
    return this.props.showMore();
  }

  handleShowLessSols() {
    return this.props.showLess();
  }

  handleSort(e) {
    const fields = e.currentTarget.dataset.sortfield ?
      [e.currentTarget.dataset.sortfield] : this.props.sorts.fields;

    const orders = e.currentTarget.dataset.sortorder ?
      [e.currentTarget.dataset.sortorder] : this.props.sorts.orders;

    const sorts = { fields, orders };
    return this.props.updateList({ sorts });
  }

  handleUpdateFilter(e) {
    const field = `${e.target.dataset.field}`;
    const toggle = e.target.dataset.toggle;
    const filter = { on: this.props.filter.on };

    if (toggle) {
      filter.on = !this.props.filter.on;

    } else if (!toggle) {
      if (e.target.type === 'checkbox') {
        filter[field] = { on: e.target.checked };

      } else {
        filter[field] = { value: e.target.value };
      }
    }

    return this.props.updateFilter(filter);
  }

  render() {

    const {
      count,
      minShown,
      maxShown,
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
        {!minShown && <button onClick={this.handleShowLessSols}>show less</button>}
        &nbsp;
        {!maxShown && <button onClick={this.handleShowMoreSols}>show more</button>}
      </div>);

    const renderFilterPane = () => {
      const filterPane = Object.keys(this.props.filter.fields)
        .map((field, i) =>
          (<div key={i}>
            <label htmlFor={`${field}`}>
              {`${field}`}
              &nbsp;
              <input type="checkbox"
                id={`${field}`}
                onClick={this.handleUpdateFilter}
                data-field={`${field}`}/>
            </label>
            &nbsp;
            {this.props.filter.fields[field].on &&
              <input
                type="number"
                value={this.props.filter.fields[field].value || 0}
                onChange={this.handleUpdateFilter}
                data-field={`${field}`}/>}
          </div>));

      return (
        <div>
          <a data-toggle onClick={this.handleUpdateFilter}>toggle filter</a>
          {this.props.filter.on && <div>{filterPane}</div>}
        </div>);
    };

    const renderSortPane = () => {// eslint-disable-line
      const sortOrder = this.props.sorts.orders[0];
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      const sortField = this.props.sorts.fields[0];
      // const newSortField = sortField === 'total_photos' ? 'cameras' : 'total_photos';
      let sortButtons = null;
      if (this.props.solsToRender && this.props.solsToRender.length) {
        sortButtons = (
          <div>
            {Object.keys(this.props.solsToRender[0]).map((key, i) =>
              <button key={i} disabled={sortField === key} data-sortfield={key} onClick={this.handleSort}>sort by {key}</button>)
            }
            &nbsp;
            <button data-sortorder={newSortOrder} onClick={this.handleSort}>sort {newSortOrder}</button>
            &nbsp;
            <div>
              current sort: {sortField} - {sortOrder}
            </div>
          </div>
        );
      }

      return sortButtons;
    };

    const sortPane = renderSortPane();
    const filterPane = renderFilterPane();

    return (
      <div className="page roverView">
        <div className="pageHeader">
          <h1>RoverView</h1>
          <p><Link to={`/${PATHS.HOME}`}>go home</Link></p>

          <div>
            {buttonPane}
            {filterPane}
            &nbsp;
            {count && <span>currently shown sols: {`${count}`}</span>}
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
        </div>

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
