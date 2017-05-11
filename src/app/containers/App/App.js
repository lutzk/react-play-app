import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
// import cn from 'classnames';
import { get } from 'lodash'; // eslint-disable-line
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { PATHS } from '../../../config/pathsConfig';
import { loadAuth, logout /* , killUser */ } from '../../redux/modules/user';
import { Footer } from './Footer';
import { Loader } from './Loader/Loader';

import './App.sass';

let mounted = false;

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { loadAuth, push, logout }),
    dispatch);

const mapStateToProps = state => ({
  user: state.user,
  loading: state.pageLoadBar.loading,
  loadEnd: state.pageLoadBar.loadEnded,
  loadError: state.pageLoadBar.error,
});

@asyncConnect([{
  key: 'App',
  promise: (options) => {
    const { store: { dispatch } } = options;
    return dispatch(loadAuth())
      .then(() => 'App');
  },
}],
mapStateToProps, mapDispatchToProps)
export default class App extends Component {

  static propTypes = {
    push: PropTypes.func,
    user: PropTypes.object,
    logout: PropTypes.func,
    children: PropTypes.any.isRequired,
    location: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    loadError: PropTypes.bool,
    loadEnded: PropTypes.bool,
    loadAuth: PropTypes.func,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
    mounted = true;
    this.props.loadAuth();
  }

  componentWillReceiveProps(nextProps) { // eslint-disable-line
    const dontPushTo = [PATHS.ROOT, PATHS.ROOT + PATHS.LOGIN];
    if (!this.props.user.user && nextProps.user.user) {
      const nextPathnameFromState = get(nextProps, 'location.state.nextPathname', false);
      const status = get(nextProps, 'routes[1].status', false);
      const status404 = status && status === 404;

      // check if it matches a route at all
      if (nextPathnameFromState && dontPushTo.indexOf(nextPathnameFromState) === -1) {
        return this.props.push(`${nextPathnameFromState}`);
      }

      if (!status404) {
        const nextPath = nextProps.user.user.savedPath || PATHS.ROVER_VIEW.ROOT;
        return this.props.push(nextPath);
      }

    } else if (this.props.user.user && !nextProps.user.user) {
      return this.props.push({
        pathname: `/${PATHS.LOGIN}`,
        state: { nextPathname: dontPushTo.indexOf(nextProps.location.pathname) === -1 ? nextProps.location.pathname : null },
      });
    }
  }

  componentWillUnMount() {
    mounted = false;
  }

  getContent() {
    const { location, children } = this.props;
    const key = location.pathname;
    if (children) {
      return React.cloneElement(children, { key });
    }
    return React.cloneElement(<div className="page loading" />, { key });
    // return null;
  }

  render() {

    const content = this.getContent();
    const loaderProps = {
      mount: mounted,
      loading: this.props.loading,
      loadEnd: this.props.loadEnded,
      loadError: this.props.loadError,
    };

    return (
      <div className="app">
        <Loader { ...loaderProps } />
        {content}
        <Footer showFooter logout={this.props.logout}/>
      </div>
    );
  }
}
