import { PouchDB } from './customPouch';

const getDBS = user => {
  if (user.user && user.user.userId) {
    return Promise.resolve({
      local: new PouchDB(`_localUser_${user.user.userId}`, {
        revs_limit: 50,
        auto_compaction: true,
      }),
      remote: new PouchDB(user.user.userDB),
    });
  }

  return Promise.resolve(false);
};

export { getDBS };
