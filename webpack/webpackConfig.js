require('@babel/register')({ // eslint-disable-line
  ignore: ['/node_modules/'],
  babelrc: false,
  presets: ['@babel/preset-env'],
});

const buildConfig = require('./configBuilder/buildConfig').buildConfig;

function config(env) {
  return buildConfig(env);
}

module.exports = config;
