export const faviconReqKiller = () => { // eslint-disable-line
  return (req, res, next) => {
    if (req.path === '/favicon.ico') {
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      return res.end();
    }
    return next();
  };
};
