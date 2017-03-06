import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { bindActionCreators } from 'redux';
import { getSolManifest, getSolManifest as refreshManifest, updateList, showMore, showLess } from '../../redux/modules/solView';
import PATHS from '../../config/pathsConfig';
import imageSrc from '../../theme/IMG_1672.jpg';
import './roverView.sass';

const asyncInfo = {
  key: 'Sol',
  promise: (options) => {
    const {
      store: { dispatch /* , getState */ },
      params: { rover, sol },
    } = options;

    return dispatch(getSolManifest(rover, sol, true)).then(() => 'Sol');
  },
};

const mapStateToProps = state => ({
  solPhotos: state.solView.listToRender,
  sortSettings: state.solView.sorts,
  count: state.solView.count,
  minShown: state.solView.minShown,
  maxShown: state.solView.maxShown,
  moreShown: state.solView.moreShown,
  manifestLoaded: state.solView.loaded,
  manifestLoading: state.solView.loading,
  initialCount: state.solView.initialCount,
  solPhotosLenght: state.solView.listLength,
  manifestLoadError: state.solView.error,
});

const mapDispatchToProps = dispatch => bindActionCreators(
  Object.assign({}, { refreshManifest, showMore, showLess, updateList }), dispatch
);

@asyncConnect([asyncInfo], mapStateToProps, mapDispatchToProps)
export default class Sol extends Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    params: PropTypes.object,
    solPhotos: PropTypes.array,
    count: PropTypes.number,
    minShown: PropTypes.bool,
    maxShown: PropTypes.bool,
    moreShown: PropTypes.bool,
    manifestLoaded: PropTypes.bool,
    manifestLoading: PropTypes.bool,
    initialCount: PropTypes.number,
    manifestLoadError: PropTypes.any,
    updateList: PropTypes.func,
    sortSettings: PropTypes.object,
    refreshManifest: PropTypes.func,
    showMore: PropTypes.func,
    showLess: PropTypes.func,
    solPhotosLenght: PropTypes.number,
  }

  constructor(props) {
    super(props);

    this.handleSort = ::this.handleSort;
    this.handleShowLess = ::this.handleShowLess;
    this.handleShowMore = ::this.handleShowMore;
    this.handleFilterByField = ::this.handleFilterByField;
    this.handleRefreshManifestRequest = ::this.handleRefreshManifestRequest;
  }

  handleRefreshManifestRequest(e) {
    const offline = !!e.target.dataset.offline;
    return this.props.refreshManifest(this.props.params.rover, this.props.params.sol, offline);
  }

  handleShowMore() {
    return this.props.showMore();
  }

  handleShowLess() {
    return this.props.showLess();
  }

  handleFilterByField(e) {
    const filter = JSON.parse(e.target.dataset.field);
    return this.props.updateList({ filter });
  }

  handleSort(e) {
    const fields = e.currentTarget.dataset.sortfield ?
      [e.currentTarget.dataset.sortfield] : this.props.sortSettings.fields;

    const orders = e.currentTarget.dataset.sortorder ?
      [e.currentTarget.dataset.sortorder] : this.props.sortSettings.orders;
    const sorts = { fields, orders };

    return this.props.updateList({ sorts });
  }

  render() {

    const {
      minShown,
      maxShown,
      count,
      solPhotosLenght,
      manifestLoaded,
      manifestLoading,
      manifestLoadError,
    } = this.props;

    const { sol, rover } = this.props.params;

    const buttonPane = (
      <div>
        <button onClick={this.handleRefreshManifestRequest}>refresh</button>
        &nbsp;
        <button onClick={this.handleRefreshManifestRequest} data-offline>refresh (offline)</button>
        {!minShown && <button onClick={this.handleShowLess}>show less</button>}
        &nbsp;
        {!maxShown && <button onClick={this.handleShowMore}>show more</button>}
        &nbsp;
        <button data-field={JSON.stringify({ field: 'camera.id', value: 31 })} onClick={this.handleFilterByField}>filter by camera id: 31</button>
        <button data-field={JSON.stringify({ off: true })} onClick={this.handleFilterByField}>filter off</button>
      </div>);

    const renderSortPane = () => {// eslint-disable-line
      const sortOrder = this.props.sortSettings.orders[0];
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      const sortField = this.props.sortSettings.fields[0];
      // const newSortField = sortField === 'total_photos' ? 'cameras' : 'total_photos';
      let sortButtons = null;
      if (this.props.solPhotos && this.props.solPhotos.length) {
        sortButtons = (
          <div>
            {Object.keys(this.props.solPhotos[0]).map((key, i) =>
              <button key={i} disabled={sortField === key} data-sortfield={key} onClick={this.handleSort}>sort by {key}</button>)
            }
            <button data-sortfield={'camera.id'} onClick={this.handleSort}>sort by camera id</button>
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

    const photoPane = (this.props.solPhotos && this.props.solPhotos.length) ?
      <div className="solsImgs">
        {this.props.solPhotos.map((photo, i) => (
          <div key={i} className="solImg">
            <h4 className="headline">photo id:&nbsp;{photo.id}</h4>
            <div className="cameraData">
              <h5 className="subHeadline">camera:&nbsp;{photo.camera.name}</h5>
              <p>id:&nbsp;{photo.camera.id}</p>
              <p>full name:&nbsp;{photo.camera.full_name}</p>
            </div>
            <p>earth_date:&nbsp;{photo.earth_date}</p>
            <img className="image" src={imageSrc} alt={photo.img_src}/>
          </div>
        ))}
      </div>
      : null;

    const sortPane = renderSortPane();

    return (
      <div className="page roverView">
        <div className="pageHeader">
          <h1><Link to={`/${PATHS.ROVER_VIEW.ROOT}/${rover}`}>{rover}</Link></h1>
          <h3>sol: {sol}</h3>
          <p><Link to={`/${PATHS.ROVER_VIEW.ROOT}/${rover}`}>back to rover</Link></p>
          <p><Link to={`/${PATHS.HOME}`}>go home</Link></p>

          <div>
            {buttonPane}
            &nbsp;
            {solPhotosLenght && <div>total photos: {`${solPhotosLenght}`}</div>}
            {count && <div>currently shown photos: {`${count}`}</div>}
          </div>

          {sortPane}

          {manifestLoading && !manifestLoadError &&
            <div className="manifestLoading"><h3>loading ...</h3></div>
          }

          {manifestLoadError &&
            <div className="error">
              something went wrong loading photos
            </div>
          }
        </div>

        {manifestLoaded &&
          <div>
            {photoPane}
            {sortPane}
            {buttonPane}
          </div>
        }

      </div>);
  }
}
