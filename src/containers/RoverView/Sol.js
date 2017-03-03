import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { getSolManifest } from '../../redux/modules/solView';
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
  solPhotos: state.solView.solPhotosToRender,
});

// const mapDispatchToProps = dispatch => bindActionCreators(
//   Object.assign({}, { refreshManifest, showMoreSols, showLessSols, push }), dispatch
// );

@asyncConnect([asyncInfo], mapStateToProps)
export default class Sol extends Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    params: PropTypes.object,
    solPhotos: PropTypes.array,
  }

  render() {

    const { solPhotos } = this.props;
    const { sol, rover } = this.props.params;
    console.dir(solPhotos);
    return (
      <div className="Page">
        <h1><Link to={`/${PATHS.ROVER_VIEW.ROOT}/${rover}`}>{rover}</Link></h1>
        <h3>sol: {sol}</h3>
        <p><Link to={`/${PATHS.ROVER_VIEW.ROOT}/${rover}`}>back to rover</Link></p>
        <p><Link to={`/${PATHS.HOME}`}>go home</Link></p>
        <div className="solsImgs">
          {solPhotos && solPhotos.length && solPhotos.map((photo, i) => (
              <div key={i} className="solImg">
                <h4 className="headline">photo id:&nbsp;{photo.id}</h4>
                <div className="cameraData">
                  <h5 className="subHeadline">camera:&nbsp;{photo.camera.name}</h5>
                  <p>full name:&nbsp;{photo.camera.full_name}</p>
                </div>
                <p>earth_date:&nbsp;{photo.earth_date}</p>
                <img className="image" src={imageSrc} alt={photo.img_src}/>
              </div>)
          )}
        </div>
      </div>);
  }
}
