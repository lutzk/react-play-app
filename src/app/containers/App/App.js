import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { redirect, NOT_FOUND, push } from 'redux-first-router';
// import cn from 'classnames';
import { get } from 'lodash'; // eslint-disable-line
import { bindActionCreators } from 'redux';
import universal from 'react-universal-component';

import { goToPage } from '../../redux/modules/page';
import { loadAuth, logout /* , killUser */ } from '../../redux/modules/user';
import { linkToSpirit, linkToLogin } from '../../redux/routing/navTypes';
import { Footer } from './Footer';
import { Loader } from './Loader/Loader';
import { makeGetUserState, makeGetUserMeta } from '../../redux/selectors/userSelector';

// import UniversalComponent from './universalComponent';

import './App.sass';


// find out why server is executing react-universal-component module twice
// wich results in following sequence:
// SETHASPLUGIN
// hasBabelPlugin false

// react-universal-component's call
// setHasBabelPlugin__CALLED
// hasBabelPlugin: true

// thats the actual issue
// and here the module is again eceuted but no call to setHasBabelPlugin results in:
// hasBabelPlugin: false

// thats our call to re enable it
// setHasBabelPlugin__CALLED
// hasBabelPlugin: true

const setPluginEnabled = () => {
  const weakId = require.resolveWeak('react-universal-component');
  const universal = __webpack_require__(weakId);// eslint-disable-line
  universal.setHasBabelPlugin();
};

setPluginEnabled();

const error = () => <div className="errorGG">UNI error</div>;
const loading = () => <div className="LoadingGG">UNI LOADING</div>;
const minDelay = 0;
const loadingTransition = false;

const options = {
  error,
  loading,
  minDelay,
  loadingTransition,
};

const UniversalComponent = universal(props =>
  import(`../asyncContext/${props.page}`),
  options
);

const makeMapStateToProps = () => {
  const getUserState = makeGetUserState();
  const getUserMeta = makeGetUserMeta();
  const mapStateToProps = (state, props) => ({
    user: getUserState(state, props),
    userMeta: getUserMeta(state, props),
    loading: state.pageLoadBar.loading,
    loadEnd: state.pageLoadBar.loadEnded,
    loadError: state.pageLoadBar.error,
    page: state.page,
    isLoading: false,
    location: state.location,
  });
  return mapStateToProps;
};

let mounted = false;

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    Object.assign({}, { loadAuth, logout, goToPage }),
    dispatch);

class AppComponent extends Component {

  static propTypes = {
    user: PropTypes.object,
    userMeta: PropTypes.object,
    logout: PropTypes.func,
    goToPage: PropTypes.func,
    location: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    loadError: PropTypes.bool,
    loadEnded: PropTypes.bool,
    loadAuth: PropTypes.func,
    page: PropTypes.any,
    isLoading: PropTypes.bool,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentDidMount() {
    mounted = true;
    this.props.loadAuth();
  }

  componentWillReceiveProps(nextProps) { // eslint-disable-line
    const { user } = this.props; // eslint-disable-line no-shadow
    const { user: nextUser /* userMeta, */ /* location: nextLocation */ } = nextProps;
    // const dontPushTo = [PATHS.ROOT, PATHS.ROOT + PATHS.LOGIN];
    // const dontPush = path => dontPushTo.indexOf(path) === -1;
    if (!user.id && nextUser.id) {
      // const nextPathnameFromState = get(nextLocation, 'type', false);
      return this.props.goToPage(linkToSpirit);
      // check if it matches a route at all
      // if (nextPathnameFromState && dontPush(nextPathnameFromState)) {
      //   // return push(`${nextPathnameFromState}`);
      //   return goToPage({ type: 'ROVER_VIEW', });
      // }
      //   return push(nextPath);

    } else if (user.id && !nextUser.id) {
      return this.props.goToPage(linkToLogin);
    }
  }

  componentWillUnMount() {
    mounted = false;
  }

  render() {

    const loaderProps = {
      mount: mounted,
      loading: this.props.loading,
      loadEnd: this.props.loadEnded,
      loadError: this.props.loadError,
    };

    return (
      <div className="app">
        <Loader { ...loaderProps } />
         <UniversalComponent page={this.props.page} isLoading={false} />
        <Footer showFooter logout={this.props.logout} />
      </div>
    );
  }
}

const App = connect(makeMapStateToProps(), mapDispatchToProps, null, { withRef: true })(AppComponent);

export { App };

