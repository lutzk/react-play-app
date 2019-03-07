import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Location } from 'redux-first-router';
import { ApplicationState } from '../../redux/modules/reducer';
import {
  getSolManifest,
  getSolManifest as refreshManifest,
  updateList,
} from '../../redux/modules/solView';
import { createRoverLink, linkToHome } from '../../redux/routing/navHelpers';
import imageSrc from '../../theme/IMG_1672.jpg';
import './RoverView.sass';

const mapStateToProps = ({ solView, location }: ApplicationState) => ({
  sorts: solView.sorts,
  range: solView.range,
  filter: solView.filter,
  listLength: solView.listLength,
  list: solView.listToRender,
  minShown: solView.minShown,
  maxShown: solView.maxShown,
  moreShown: solView.moreShown,
  manifestLoaded: solView.loaded,
  manifestLoading: solView.loading,
  initialCount: solView.initialCount,
  manifestLoadError: solView.error,
  location,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { refreshManifest, updateList }),
    dispatch,
  );

interface Props {
  location: Location;
  range: any;
  sorts: any;
  filter: any;
  list: any[];
  minShown: boolean;
  maxShown: boolean;
  moreShown: boolean;
  manifestLoaded: boolean;
  manifestLoading: boolean;
  initialCount: number;
  manifestLoadError: any;
  updateList: any;
  refreshManifest: any;
  listLength: number;
}

class SolView extends Component<Props> {
  constructor(props) {
    super(props);

    this.handleSort = this.handleSort.bind(this);
    this.handleRangeUpdate = this.handleRangeUpdate.bind(this);
    this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
    this.handleRefreshManifestRequest = this.handleRefreshManifestRequest.bind(
      this,
    );
  }

  public handleRefreshManifestRequest(e) {
    const offline = !!e.currentTarget.dataset.offline;
    return this.props.refreshManifest(
      (this.props.location.payload as any).rover,
      (this.props.location.payload as any).sol,
      offline,
    );
  }

  public handleSort(e) {
    const fields = e.currentTarget.dataset.sortfield
      ? [e.currentTarget.dataset.sortfield]
      : this.props.sorts.fields;

    const orders = e.currentTarget.dataset.sortorder
      ? [e.currentTarget.dataset.sortorder]
      : this.props.sorts.orders;

    const sorts = { fields, orders };
    return this.props.updateList({ sorts });
  }

  public handleUpdateFilter(e) {
    const { field, toggle } = e.currentTarget.dataset;
    const filter = { on: this.props.filter.on };

    if (toggle) {
      filter.on = !this.props.filter.on;
    } else if (field && !toggle) {
      if (e.currentTarget.type === 'checkbox') {
        filter[field] = { on: e.currentTarget.checked };
      } else if (e.currentTarget.type === 'number') {
        filter[field] = { value: parseInt(e.currentTarget.value, 10) };
      } else {
        filter[field] = { value: e.currentTarget.value };
      }
    }

    return this.props.updateList({ filter });
  }

  public handleRangeUpdate(e) {
    const action = e.currentTarget.dataset.range;
    const range = { action };
    return this.props.updateList({ range });
  }

  public render() {
    const {
      // minShown,
      // maxShown,
      // listLength,
      manifestLoaded,
      manifestLoading,
      manifestLoadError,
    } = this.props;

    const { sol, rover } = (this.props.location as any).payload;

    const loadPane = (
      <div className="loadPane">
        <button onClick={this.handleRefreshManifestRequest}>refresh</button>
        <button onClick={this.handleRefreshManifestRequest} data-offline="true">
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
          <a data-toggle="true" onClick={this.handleUpdateFilter}>
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
      const sortOrder = 'asc'; // his.props.sorts.orders[0];
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
