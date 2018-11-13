import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getSolManifest,
  getSolManifest as refreshManifest,
  updateList,
} from '../../redux/modules/solView';
import { createRoverLink, linkToHome } from '../../redux/routing/navTypes';
import imageSrc from '../../theme/IMG_1672.jpg';
import './RoverView.sass';

const mapStateToProps = state => ({
  sorts: state.solView.sorts,
  range: state.solView.range,
  filter: state.solView.filter,
  listLength: state.solView.listLength,
  list: state.solView.listToRender,
  minShown: state.solView.minShown,
  maxShown: state.solView.maxShown,
  moreShown: state.solView.moreShown,
  manifestLoaded: state.solView.loaded,
  manifestLoading: state.solView.loading,
  initialCount: state.solView.initialCount,
  manifestLoadError: state.solView.error,
  location: state.location,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { refreshManifest, updateList }),
    dispatch,
  );

class SolView extends Component {
  static propTypes = {
    location: PropTypes.object,
    range: PropTypes.object,
    sorts: PropTypes.object,
    filter: PropTypes.object,
    list: PropTypes.array,
    minShown: PropTypes.bool,
    maxShown: PropTypes.bool,
    moreShown: PropTypes.bool,
    manifestLoaded: PropTypes.bool,
    manifestLoading: PropTypes.bool,
    initialCount: PropTypes.number,
    manifestLoadError: PropTypes.any,
    updateList: PropTypes.func,
    refreshManifest: PropTypes.func,
    listLength: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.handleSort = this.handleSort.bind(this);
    this.handleRangeUpdate = this.handleRangeUpdate.bind(this);
    this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
    this.handleRefreshManifestRequest = this.handleRefreshManifestRequest.bind(
      this,
    );
  }

  handleRefreshManifestRequest(e) {
    const offline = !!e.target.dataset.offline;
    return this.props.refreshManifest(
      this.props.location.payload.rover,
      this.props.location.payload.sol,
      offline,
    );
  }

  handleSort(e) {
    const fields = e.currentTarget.dataset.sortfield
      ? [e.currentTarget.dataset.sortfield]
      : this.props.sorts.fields;

    const orders = e.currentTarget.dataset.sortorder
      ? [e.currentTarget.dataset.sortorder]
      : this.props.sorts.orders;

    const sorts = { fields, orders };
    return this.props.updateList({ sorts });
  }

  handleUpdateFilter(e) {
    const { field, toggle } = e.target.dataset;
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
      // minShown,
      // maxShown,
      // listLength,
      manifestLoaded,
      manifestLoading,
      manifestLoadError,
    } = this.props;

    const { sol, rover } = this.props.location.payload;

    const loadPane = (
      <div className="loadPane">
        <button onClick={this.handleRefreshManifestRequest}>refresh</button>
        <button onClick={this.handleRefreshManifestRequest} data-offline>
          refresh (offline)
        </button>
      </div>
    );

    const renderFilterPane = () => {
      const filterPane = Object.keys(this.props.filter.fields).map(
        (field, i) => (
          <div key={i}>
            <label htmlFor={`${field}`}>
              {`${field}`}
              &nbsp;
              <input
                type="checkbox"
                id={`${field}`}
                onClick={this.handleUpdateFilter}
                data-field={`${field}`}
              />
            </label>
            &nbsp;
            {this.props.filter.fields[field].on && (
              <input
                type={
                  typeof this.props.filter.fields[field].value === 'number'
                    ? 'number'
                    : 'text'
                }
                value={this.props.filter.fields[field].value}
                onChange={this.handleUpdateFilter}
                data-field={`${field}`}
              />
            )}
          </div>
        ),
      );

      return (
        <div className="filterPane">
          <a data-toggle onClick={this.handleUpdateFilter}>
            toggle filter
          </a>
          {this.props.filter.on && <div>{filterPane}</div>}
        </div>
      );
    };

    const renderRangePane = () => {
      const {
        listLength,
        range: { start, end },
      } = this.props;
      const currentRange = end - start;
      // maxSol
      if (this.props.list && this.props.list.length) {
        return (
          <div className="rangePane">
            {currentRange > 0 && (
              <button data-range="next" onClick={this.handleRangeUpdate}>
                next {currentRange}
              </button>
            )}
            {currentRange > 0 && start >= currentRange && (
              <button data-range="prev" onClick={this.handleRangeUpdate}>
                prev {currentRange}
              </button>
            )}
            {currentRange > 0 && (
              <button data-range="less" onClick={this.handleRangeUpdate}>
                show less
              </button>
            )}
            {end < listLength && (
              <button data-range="more" onClick={this.handleRangeUpdate}>
                show more
              </button>
            )}
          </div>
        );
      }
      return null;
    };

    const renderSortPane = () => {
      const sortOrder = this.props.sorts.orders[0];
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      const sortField = this.props.sorts.fields[0];
      // const newSortField = sortField === 'total_photos' ? 'cameras' : 'total_photos';
      let sortButtons = null;
      if (this.props.list && this.props.list.length) {
        sortButtons = (
          <div className="sortPane">
            {Object.keys(this.props.list[0]).map((key, i) => (
              <button
                key={i}
                className={sortField === key ? 'enabled' : ''}
                disabled={sortField === key}
                data-sortfield={key}
                onClick={this.handleSort}
              >
                sort by {key}
              </button>
            ))}
            <button data-sortorder={newSortOrder} onClick={this.handleSort}>
              sort {newSortOrder}
            </button>
            {/* <div>
              current sort: {sortField} - {sortOrder}
            </div> */}
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

    const photoPane =
      this.props.list && this.props.list.length ? (
        <div className="solsImgs">
          {this.props.list.map((photo, i) => (
            <div key={i} className="solImg">
              <h4 className="headline">
                photo id:&nbsp;
                {photo.id}
              </h4>
              <div className="cameraData">
                <h5 className="subHeadline">
                  camera:&nbsp;
                  {photo.camera.name}
                </h5>
                <p>
                  id:&nbsp;
                  {photo.camera.id}
                </p>
                <p>
                  full name:&nbsp;
                  {photo.camera.fullName}
                </p>
              </div>
              <p>
                earth_date:&nbsp;
                {photo.earthDate}
              </p>
              <img className="image" src={photo.imgSrc} alt={photo.imgSrc} />
            </div>
          ))}
        </div>
      ) : null;

    return (
      <div className="page roverView">
        <div className="pageHeader">
          {/* <h1>
            <span to={createRoverLink({ rover })}>{rover}</span>
          </h1> */}
          <h3>sol: {sol}</h3>
          {/* <p>
            <span to={linkToHome}>go home</span>
          </p> */}
          <p>
            {this.props.listLength && (
              <span>total pics: {this.props.listLength}</span>
            )}
          </p>

          {loadPane}

          {manifestLoading && !manifestLoadError && (
            <div className="pageContent manifestLoading">
              <h3>loading ...</h3>
            </div>
          )}

          {manifestLoadError && (
            <div className="pageContent error">
              something went wrong loading photos
            </div>
          )}
        </div>

        {manifestLoaded && (
          <div className="pageContent">
            {buttonPane}
            {renderFilterPane()}
            {photoPane}
            {buttonPane}
            {loadPane}
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SolView);
