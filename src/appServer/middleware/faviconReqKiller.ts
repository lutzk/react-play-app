import { asyncWrap as aw } from '../../helpers/utils';

export const faviconReqKiller = () =>
  aw(async (req, res, next) => {
    if (req.path === '/favicon.ico') {
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      return res.end();
    }
    return next();
  });
