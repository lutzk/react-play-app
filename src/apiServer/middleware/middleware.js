// import { authTokenKey } from '../config';
import { asyncWrap as aw } from '../utils/utils';

const checkAuth = () => aw(async (req, res, next) => {
  if (!res.locals.authenticated) {
    return res
      .set('Content-Type', 'text/html')
      .status(401).json({ error: 'forbidden' }).end();
  }

  return next();
});

const checkRedisSession = () => aw(async (req, res, next) => {
  if (!req.session) {
    return next(new Error('Cannot persist session on Redis, check Redis service'));
  }
  return next();
});

const setAuth = () => aw(async (req, res, next) => {
  // res.locals.token = req.headers[authTokenKey]; // eslint-disable-line
  res.locals.authenticated = !(req.session.user === null || req.session.user === undefined); // eslint-disable-line
  return next();
});

const errorHandler = () => (err, req, res, next) => {
  console.log('_ERROR_HANDLER_');
  console.log(err);
  // add more specific response
  return res.status(err.status || 500).json({ error: err }).end();
};

export {
  setAuth,
  checkAuth,
  errorHandler,
  checkRedisSession,
};
