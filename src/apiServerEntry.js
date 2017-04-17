const fs = require('fs');

let dotenv = null;

fs.access('.env', fs.F_OK || fs.R_OK, (err) => {
  if (!err) {
    dotenv = require('dotenv');// eslint-disable-line

    dotenv.load();
  }
});

if (process.env.NODE_ENV !== 'production') {
  (() => {
    if (!require('piping')(// eslint-disable-line
      {
        hook: true,
        ignore: /(\/\.|~$|\.json$|\.\/node_modules\/$)/i,
      }
    )) {
      // return;
    }
  })();
}

require('./apiServer/server');
