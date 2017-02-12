#!/usr/bin/env node

(function () {
  if (!require('piping')(
    {
      hook: true,
      ignore: /(\/\.|~$|\.json|\.scss|\.sass$)/i
    }
  )) {
    // return;
  }
}());
