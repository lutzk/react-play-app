// import React, { Component } from 'react';
// import { redirect, NOT_FOUND, push } from 'redux-first-router';
// import cn from 'classnames';
import { get } from 'lodash'; // eslint-disable-line
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import universal from 'react-universal-component';
import { bindActionCreators } from 'redux';

import { goToPage } from '../../redux/modules/page';
import { loadAuth, logout } from '../../redux/modules/user';
import { linkToLogin, linkToSpirit } from '../../redux/routing/navTypes';
import {
  makeGetUserMeta,
  makeGetUserState,
} from '../../redux/selectors/userSelector';
import { Footer } from './Footer';
import { Loader } from './Loader/Loader';

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

// without it would just get 'default' chunkname
const setPluginEnabled = () => {
  const weakId = require.resolveWeak('react-universal-component');
  const universal = __webpack_require__(weakId); // eslint-disable-line
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
  ignoreBabelRename: true,
  chunkName: data => {
    console.log('DATA chunkName:', data);
    return data.page;
  },
};

const UniversalComponent = universal(
  props =>
    import(/* webpackChunkName: [request] */ `../asyncContext/${props.page}`),
  options,
);

const makeMapStateToProps = () => {
  const getUserState = makeGetUserState();
  const getUserMeta = makeGetUserMeta();
  const mapStateToProps = (state, props) => ({
    user: state.user, // getUserState(state, props),
    page: state.page,
    loading: state.pageLoadBar.loading,
    loadEnd: state.pageLoadBar.loadEnded,
    location: state.location,
    userMeta: state.userMeta, // getUserMeta(state, props),
    loadError: state.pageLoadBar.error,
    isLoading: false,
  });
  return mapStateToProps;
};

let mounted = false;

const mapDispatchToProps = dispatch =>
  bindActionCreators({ ...{ loadAuth, logout, goToPage } }, dispatch);

declare interface Props {
  user: any; // PropTypes.object;
  page: any;
  logout: any; // PropTypes.func,
  loading: boolean;
  loadAuth: any; // PropTypes.func,
  userMeta: any; // PropTypes.object,
  goToPage: any; // PropTypes.func,
  location: any; // PropTypes.object.isRequired,
  loadError: boolean;
  loadEnded: boolean;
  isLoading: boolean;
}

class AppComponent extends React.Component<Props> {
  // static propTypes = {
  //   user: PropTypes.object,
  //   page: PropTypes.any,
  //   logout: PropTypes.func,
  //   loading: PropTypes.bool,
  //   loadAuth: PropTypes.func,
  //   userMeta: PropTypes.object,
  //   goToPage: PropTypes.func,
  //   location: PropTypes.object.isRequired,
  //   loadError: PropTypes.bool,
  //   loadEnded: PropTypes.bool,
  //   isLoading: PropTypes.bool,
  // };

  // static contextTypes = {
  //   store: PropTypes.object.isRequired,
  // };

  public componentDidMount() {
    mounted = true;
    console.log('mount');
    this.props.loadAuth();
  }

  // componentDidMount() {
  //   console.log('mount');
  // }

  public componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate');
    console.log({ ...prevProps });
    console.log({ ...prevState });
    console.log({ ...snapshot });
    const { user } = prevProps; // this.props; // eslint-disable-line no-shadow
    const {
      user: nextUser /* userMeta, */ /* location: nextLocation */,
    } = this.props;
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

  public componentWillReceiveProps(nextProps) {
    // eslint-disable-line
    console.log('componentWillReceiveProps');
    const { user } = this.props; // eslint-disable-line no-shadow
    const {
      user: nextUser /* userMeta, */ /* location: nextLocation */,
    } = nextProps;
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

  public componentWillUnMount() {
    mounted = false;
  }

  public componentDidCatch(err, info) {
    console.log('___ERROR CATCHED__', err, info);
  }

  public render() {
    const loaderProps = {
      mount: mounted,
      loading: this.props.loading,
      loadEnd: this.props.loadEnded,
      loadError: this.props.loadError,
    };

    // const getA = page => import(`../asynC2/${page}`).then(
    //   m => console.log('MODULE FUNC', m.default)
    // );
    // getA('a');

    return (
      <div className="app">
        <Loader {...loaderProps} />
        <UniversalComponent
          key={this.props.page}
          page={this.props.page}
          isLoading={false}
        />
        <Footer showFooter={true} logout={this.props.logout} />
      </div>
    );
  }
}

const App = connect(
  makeMapStateToProps(),
  mapDispatchToProps,
  null,
  { withRef: true },
)(AppComponent);

export { App };
