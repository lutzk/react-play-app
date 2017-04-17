import { authTokenKey } from '../config';

const checkAuth = () => (req, res, next) => {
  if (!res.locals.authenticated) {
    res
      .set('Content-Type', 'text/html')
      .status(401).json({ error: 'forbidden' }).end();
  } else {
    next();
  }
};

const checkRedisSession = () => (req, res, next) => {
  if (!req.session) {
    return next(new Error('Cannot persist session on Redis, check Redis service'));
  }
  return next();
};

const setAuth = () => (req, res, next) => {
  res.locals.token = req.headers[authTokenKey]; // eslint-disable-line
  res.locals.authenticated = !(req.session.user === null || req.session.user === undefined); // eslint-disable-line
  next();
};

const errorHandler = () => (err, req, res) => {
  console.log('____ERROR__HANDLER___');
  console.log(err);
  res.status(500);
  res.render('error', { error: err });
};

export {
  setAuth,
  checkAuth,
  errorHandler,
  checkRedisSession,
};
