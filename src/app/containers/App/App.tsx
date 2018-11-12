// import { redirect, NOT_FOUND, push } from 'redux-first-router';
// import cn from 'classnames';
import { get } from 'lodash'; // eslint-disable-line
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
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
import UniversalComponent from './UniversalComponent';

import './App.sass';


// React.memo(

const makeMapStateToProps = () => {
  const getUserState = makeGetUserState();
  const getUserMeta = makeGetUserMeta();
  const mapStateToProps = (state, props) => ({
    user: state.user, // getUserState(state, props),
    page: state.page,
    location: state.location,
    userMeta: state.userMeta, // getUserMeta(state, props),
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
  loadAuth: any; // PropTypes.func,
  userMeta: any; // PropTypes.object,
  goToPage: any; // PropTypes.func,
  location: any; // PropTypes.object.isRequired,
  isLoading: boolean;
}

class AppComponent extends React.Component<Props> {
  // static getDerivedStateFromProps(nextProps, currentState) {
  //   // lala
  //   return null;
  // }

  public componentDidMount() {
    mounted = true;
    this.props.loadAuth();
  }

  public componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('___RENDER__');
    const { user } = prevProps;
    const {
      user: nextUser,
      /* userMeta, */ location: nextLocation,
    } = this.props;
    // const dontPushTo = [PATHS.ROOT, PATHS.ROOT + PATHS.LOGIN];
    // const dontPush = path => dontPushTo.indexOf(path) === -1;
    if (!user.user && (nextUser.user && nextUser.user.userId)) {
      // const nextPathnameFromState = get(nextLocation, 'type', false);
      // return this.props.goToPage(linkToSpirit);
      // check if it matches a route at all
      // if (nextPathnameFromState && dontPush(nextPathnameFromState)) {
      //   // return push(`${nextPathnameFromState}`);
      //   return goToPage({ type: 'ROVER_VIEW', });
      // }
      //   return push(nextPath);
    } else if (user.user && user.user.userId && !nextUser.user) {
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
    console.log('___RENDER__');
    return (
      <React.StrictMode>
        <div className="app">
          <Loader mount={mounted} />
          <UniversalComponent
            // key={this.props.page}
            page={this.props.page}
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
    // { forwardRef: true },
  )(AppComponent),
);

export { App };
