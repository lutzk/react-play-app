import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getManifest, getManifest as refreshManifest, roverMatcher, updateList } from '../../redux/modules/roverView';
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
  range: state.roverView.range,
  filter: state.roverView.filter,
  roverName: state.roverView.roverName,
  listLenght: state.roverView.listLenght,
  missionStats: state.roverView.missionStats,
  solsToRender: state.roverView.listToRender,
  manifestLoaded: state.roverView.loaded,
  manifestLoading: state.roverView.loading,
  initialSolCount: state.roverView.initialCount,
  manifestLoadError: state.roverView.error,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { refreshManifest, updateList }),
    dispatch);

@asyncConnect(
  [asyncInfo],
  mapStateToProps,
  mapDispatchToProps
)
export default class RoverView extends Component {

  static propTypes = {
    range: PropTypes.object,
    sorts: PropTypes.object,
    filter: PropTypes.object,
    params: PropTypes.object,
    roverName: PropTypes.string,
    updateList: PropTypes.func,
    listLenght: PropTypes.number,
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

    this.handleSort = ::this.handleSort;
    this.handleRangeUpdate = ::this.handleRangeUpdate;
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

  handleSort(e) {
    const fields = e.currentTarget.dataset.sortfield ?
      [e.currentTarget.dataset.sortfield] : this.props.sorts.fields;

    const orders = e.currentTarget.dataset.sortorder ?
      [e.currentTarget.dataset.sortorder] : this.props.sorts.orders;

    const sorts = { fields, orders };
    return this.props.updateList({ sorts });
  }

  handleUpdateFilter(e) {
    const field = e.target.dataset.field;
    const toggle = e.target.dataset.toggle;
    const filter = { on: this.props.filter.on };

    if (toggle) {
      filter.on = !this.props.filter.on;

    } else if (field && !toggle) {
      if (e.target.type === 'checkbox') {
        filter[field] = { on: e.target.checked };

      } else if (e.target.type === 'number') {
        filter[field] = { value: parseInt(e.target.value, 10) };

      } else {
        filter[field] = { value: e.target.value };
      }
    }

    return this.props.updateList({ filter });
  }

  handleRangeUpdate(e) {
    const action = e.target.dataset.range;
    const range = { action };
    return this.props.updateList({ range });
  }

  render() {

    const {
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

    const loadPane = (
      <div>
        <button onClick={this.handleRefreshManifestRequest}>refresh</button>
        &nbsp;
        <button onClick={this.handleRefreshManifestRequest} data-offline>refresh (offline)</button>
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
                type={typeof this.props.filter.fields[field].value === 'number' ? 'number' : 'text'}
                value={this.props.filter.fields[field].value}
                onChange={this.handleUpdateFilter}
                data-field={`${field}`}/>}
          </div>));

      return (
        <div>
          <a data-toggle onClick={this.handleUpdateFilter}>toggle filter</a>
          {this.props.filter.on &&
            <div>
              {filterPane}
            </div>}
        </div>);
    };

    const renderRangePane = () => {
      const { listLenght, range: { start, end } } = this.props;
      const currentRange = end - start;
      console.log(listLenght, start, end, currentRange);
      return (
        <div>
          {currentRange > 0 && <button data-range="next" onClick={this.handleRangeUpdate}>next {currentRange}</button>}
          {currentRange > 0 && start > currentRange && <button data-range="prev" onClick={this.handleRangeUpdate}>prev {currentRange}</button>}
          {currentRange > 0 && <button data-range="less" onClick={this.handleRangeUpdate}>show less</button>}
          {end < listLenght && <button data-range="more" onClick={this.handleRangeUpdate}>show more</button>}
          {currentRange > 0 &&
            <div>
              <span>sols: {`${currentRange}`},</span>
              &nbsp;
              <span>current range: {start + 1} - {end + 1}</span>
            </div>}
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

    const buttonPane = (
      <div>
        {loadPane}
        {renderSortPane()}
        {renderFilterPane()}
        {renderRangePane()}
      </div>
    );

    return (
      <div className="page roverView">
        <div className="pageHeader">
          <h1>RoverView</h1>
          <p><Link to={`/${PATHS.HOME}`}>go home</Link></p>

          <div>
            {buttonPane}
          </div>

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
            {buttonPane}
          </div>
        }
      </div>);
  }
}
