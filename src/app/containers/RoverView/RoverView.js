import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'redux-first-router-link';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { /* initPage, */ getManifest as refreshManifest, updateList } from '../../redux/modules/roverView';
import { linkToHome } from '../../redux/routing/navTypes';
import RoverMissionStats from './RoverMissionStats';
import RoverMissionSols from './RoverMissionSols';
import './RoverView.sass';


const mapStateToProps = state => ({
  syncing: state.app.syncing,
  savedData: state.app.savedData,
  sorts: state.roverView.sorts,
  range: state.roverView.range,
  maxSol: state.roverView.maxSol,
  filter: state.roverView.filter,
  roverName: state.roverView.roverName,
  listLength: state.roverView.listLength,
  missionStats: state.roverView.missionStats,
  solsToRender: state.roverView.listToRender,
  loaded: state.roverView.loaded,
  loading: state.roverView.loading,
  initialSolCount: state.roverView.initialCount,
  manifestLoadError: state.roverView.error,
  location: state.location,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { refreshManifest, updateList }),
    dispatch);

class RoverView extends Component {

  static propTypes = {
    location: PropTypes.object,
    syncing: PropTypes.bool,
    savedData: PropTypes.object,
    range: PropTypes.object,
    sorts: PropTypes.object,
    filter: PropTypes.object,
    params: PropTypes.object,
    maxSol: PropTypes.number,
    roverName: PropTypes.string,
    updateList: PropTypes.func,
    listLength: PropTypes.number,
    missionStats: PropTypes.object,
    solsToRender: PropTypes.array,
    loaded: PropTypes.bool,
    refreshManifest: PropTypes.func,
    loading: PropTypes.bool,
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
    if (!this.props.location.payload.rover && this.props.roverName) {
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
    // console.log('__FILTER__', field, toggle, filter);
    // console.log({ ...{ filter: this.props.filter } });
    if (toggle) {
      filter.on = !this.props.filter.on;
      // console.log('__FILTER__', 1);
    } else if (field && !toggle) {
      if (e.target.type === 'checkbox') {
        filter[field] = { on: e.target.checked };
        // console.log('__FILTER__', 2);
      } else if (e.target.type === 'number') {
        filter[field] = { value: parseInt(e.target.value, 10) };
        // console.log('__FILTER__', 3);
      } else {
        filter[field] = { value: e.target.value };
        // console.log('__FILTER__', 4);
      }
    }

    return this.props.updateList({ filter });
  }

  handleRangeUpdate(e) {
    const action = e.target.dataset.range;
    const range = { action };
    return this.props.updateList({ range });
  }

  // will execute on server render
  // fetchData() {
  //   return Promise.resolve(initPage); // eslint-disable-line
  // }

  render() {

    const {
      loaded,
      loading,
      syncing,
      savedData,
      manifestLoadError,
    } = this.props;

    /* eslint-disable */
    const getListStats = () => {
      const { solsToRender, listLength, range: { start, end } } = this.props;
      let sols = null;
      let maxSol = null;
      let minSol = null;
      let stats = null;
      const currentRange = end - start;
      // solsToRender && solsToRender.length && solsToRender.map(sol => sol.sol);

      if (solsToRender && solsToRender.length) {
        sols = solsToRender.map(sol => sol.sol);
        maxSol = Math.max(...sols);
        minSol = Math.min(...sols);

        stats = (
          <div className="statsPane">
            total count: {listLength},
            <br />
            current count: {solsToRender.length + 1}
            <br />
            min shown sol: {minSol},
            <br />
            max shown sol: {maxSol}
          </div>);

        return stats;
      }
    };
    /* eslint-enable */

    const missionStatsProps = {
      roverName: this.props.roverName,
      missionStats: this.props.missionStats,
    };

    const missionSolsProps = {
      sols: this.props.solsToRender,
      rover: this.props.roverName ? this.props.roverName.toLowerCase() : '',
    };

    const loadPane = (
      <div className="loadPane">
        <button onClick={this.handleRefreshManifestRequest}>refresh</button>
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
                checked={this.props.filter.fields[field].on}
                onChange={this.handleUpdateFilter}
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
        <div className="filterPane">
          <a data-toggle onClick={this.handleUpdateFilter}>toggle filter</a>
          {this.props.filter.on &&
            <div>
              {filterPane}
            </div>}
        </div>);
    };

    const renderRangePane = () => {
      const { listLength, range: { start, end } } = this.props;
      const currentRange = end - start;
      // maxSol
      if (this.props.solsToRender && this.props.solsToRender.length) {
        return (
          <div className="rangePane">
            {currentRange > 0 && <button data-range="next" onClick={this.handleRangeUpdate}>next {currentRange}</button>}
            {currentRange > 0 && start >= currentRange && <button data-range="prev" onClick={this.handleRangeUpdate}>prev {currentRange}</button>}
            {currentRange > 0 && <button data-range="less" onClick={this.handleRangeUpdate}>show less</button>}
            {end < listLength && <button data-range="more" onClick={this.handleRangeUpdate}>show more</button>}
          </div>);
      }
      return null;
    };

    const renderSortPane = () => {// eslint-disable-line
      const sortOrder = this.props.sorts.orders[0];
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      const sortField = this.props.sorts.fields[0];
      // const newSortField = sortField === 'total_photos' ? 'cameras' : 'total_photos';
      let sortButtons = null;
      if (this.props.solsToRender && this.props.solsToRender.length) {
        sortButtons = (
          <div className="sortPane">
            {Object.keys(this.props.solsToRender[0]).map((key, i) =>
              <button key={i} className={sortField === key ? 'enabled' : ''} disabled={sortField === key} data-sortfield={key} onClick={this.handleSort}>sort by {key}</button>)
            }
            <button data-sortorder={newSortOrder} onClick={this.handleSort}>sort {newSortOrder}</button>
            { /* <div>
              current sort: {sortField} - {sortOrder}
            </div> */ }
          </div>
        );
      }

      return sortButtons;
    };

    const buttonPane = (
      <div className="buttonPane">
        {renderRangePane()}
        {renderSortPane()}
      </div>
    );

    return (
      <div className="page roverView">
        <div className="pageHeader">
          <h1>RoverView</h1>
          {syncing && <div>...SAVING DATA ...</div>}
          {savedData && !syncing && <div>...SAVED!</div>}
          <p><Link to={linkToHome}>go home</Link></p>

          {loadPane}

          {loading && !manifestLoadError &&
            <div className="pageContent loading"><h3>loading ...</h3></div>
          }

          {manifestLoadError &&
            <div className="pageContent error">
              something went wrong loading rover manifest
            </div>
          }
        </div>

        {loaded && !manifestLoadError &&
          <div className="pageContent">
            <RoverMissionStats {...missionStatsProps} />
            {buttonPane}
            {renderFilterPane()}
            <RoverMissionSols {...missionSolsProps} />
            {buttonPane}
            {loadPane}
          </div>
        }
      </div>);
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(RoverView);

