import { createSelector } from 'reselect';

const getUser = (state, props) => {
  const userState = state.user;
  // console.log('__USER__STATE', userState);
  let user = {};
  if (userState.user) {
    user = {
      id: userState.user.userId,
      db: userState.user.userDB,
    };
  }
  return user;
};

const getUserMeta = (state, props) => {
  const userState = state.user;
  // console.log('__USER__STATE', userState);
  let userMeta = {};
  if (userState) {
    userMeta = {
      savedPath: userState.savedPath,
      loggedIn: userState.loggedIn,
      loggingIn: userState.loggingIn,
      lastLoaded: userState.lastLoaded,
    };
  }
  return userMeta;
};

const makeGetUserState = () => createSelector([getUser], user => user);

const makeGetUserMeta = () =>
  createSelector([getUserMeta], userMeta => userMeta);

export { makeGetUserState, makeGetUserMeta };
