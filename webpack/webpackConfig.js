require('babel-register')({ // eslint-disable-line
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['es2015', 'stage-0'],
});

const buildConfig = require('./configBuilder/buildConfig').buildConfig;

function config(env) {
  return buildConfig(env);
}

module.exports = config;
