import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { redirect, NOT_FOUND, push } from 'redux-first-router';
// import cn from 'classnames';
import { get } from 'lodash'; // eslint-disable-line
import { bindActionCreators } from 'redux';
// import { PATHS } from '../../../config/pathsConfig';
import { goToPage } from '../../redux/modules/page';
import { loadAuth, logout /* , killUser */ } from '../../redux/modules/user';
import { Footer } from './Footer';
import { Loader } from './Loader/Loader';
import { makeGetUserState, makeGetUserMeta } from '../../redux/selectors/userSelector';
import { getComponent } from '../../universalComponents';

import './App.sass';

// const mapState = ({ page }) => {
//   const isLoading = false;
//   return { page, isLoading };
// };

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

class App extends Component {

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
    // console.log('__componentWillReceiveProps__', 0);
    // console.log(this.props, nextProps);
    if (!user.id && nextUser.id) {
      // console.log('__componentWillReceiveProps__', 1);
      // debugger;// eslint-disable-line
      // const nextPathnameFromState = get(nextLocation, 'type', false);
      // const status = get(nextProps, 'routes[1].status', false);
      // const status404 = status && status === 404;
      return this.props.goToPage({ type: 'ROVER_VIEW', payload: { rover: 'Spirit' } });
      // return push('/rover-view/Spirit');
      // check if it matches a route at all
      // if (nextPathnameFromState && dontPush(nextPathnameFromState)) {
      //   // return push(`${nextPathnameFromState}`);
      //   return goToPage({ type: 'ROVER_VIEW', });
      // }

      // if (!status404) {
      //   const nextPath = userMeta.savedPath || PATHS.ROVER_VIEW.ROOT;

      //   return push(nextPath);
      // }

    } else if (user.id && !nextUser.id) {
      // console.log('__componentWillReceiveProps__', 2);
      // return push('/login');
      return this.props.goToPage({ type: 'LOGIN' });
      // return push({
      //   pathname: `/${PATHS.LOGIN}`,
      //   state: { nextPathname: dontPush(nextLocation.pathname) === -1 ? nextLocation.pathname : null },
      // });
    }
  }

  componentWillUnMount() {
    mounted = false;
  }

  fetchData() {
    return Promise.resolve(loadAuth);
  }

  render() {

    const loaderProps = {
      mount: mounted,
      loading: this.props.loading,
      loadEnd: this.props.loadEnded,
      loadError: this.props.loadError,
    };

    const UniversalComponent = getComponent({ page: this.props.page });

    return (
      <div className="app">
        <Loader { ...loaderProps } />
        {UniversalComponent}
        <Footer showFooter logout={this.props.logout}/>
      </div>
    );
  }
}

const ReduxApp = connect(makeMapStateToProps(), mapDispatchToProps, null, { withRef: true })(App);

export { ReduxApp };

