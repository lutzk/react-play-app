// import { redirect, NOT_FOUND, push } from 'redux-first-router';
// import cn from 'classnames';
import { get } from 'lodash'; // eslint-disable-line
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
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

import './App.sass';

declare var module: any;

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
  const universal = __webpack_require__(weakId);
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
  chunkName: data => data.page,
};

const UniversalComponent = React.memo(
  universal(
    props =>
      import(/* webpackChunkName: [request] */ `../asyncContext/${props.page}`),
    options,
  ),
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
  user: any;
  page: any;
  logout: any;
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
  public componentDidMount() {
    mounted = true;
    this.props.loadAuth();
  }

  public componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('componentDidUpdate');
    // console.log('prevProps: ', { ...prevProps });
    // console.log('newProps: ', { ...this.props });
    const { user } = prevProps;
    const {
      user: nextUser,
      /* userMeta, */ location: nextLocation,
    } = this.props;
    // const dontPushTo = [PATHS.ROOT, PATHS.ROOT + PATHS.LOGIN];
    // const dontPush = path => dontPushTo.indexOf(path) === -1;
    if (!user.id && nextUser.id) {
      const nextPathnameFromState = get(nextLocation, 'type', false);
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

    return (
      <React.StrictMode>
        <div className="app">
          <Loader {...loaderProps} />
          <UniversalComponent
            key={this.props.page}
            page={this.props.page}
            isLoading={false}
          />
          <Footer showFooter={true} logout={this.props.logout} />
        </div>
      </React.StrictMode>
    );
  }
}

const App = hot(module)(
  connect(
    makeMapStateToProps(),
    mapDispatchToProps,
    null,
    { withRef: true },
  )(AppComponent),
);

export { App };
