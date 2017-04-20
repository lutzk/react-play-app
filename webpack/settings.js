import path from 'path';

const context = path.resolve(__dirname, '..');
const rootPath = `${process.cwd()}/`;

const host = 'localhost';
const assetServerPort = parseInt(process.env.ASSET_SERVER_PORT, 10) || 3011;

const publicPath = '/dist/assets/';
const publicPathDev = `http://${host}:${assetServerPort}${publicPath}`;
const publicPathProd = publicPath;

const assetsPath = path.resolve(__dirname, '../static/dist/assets/');
const relativeAssetsPath = 'static/dist/assets/';
const embedLimit = 10240;

const serverBuildPath = path.resolve(__dirname, '../bin/');
const relativeServerBuildPath = 'bin/';

const appServer = 'appServer.js';
const apiServer = 'apiServer.js';
const relativeAppServerBuildPath = `${relativeServerBuildPath}${appServer}`;
const relativeApiServerBuildPath = `${relativeServerBuildPath}${apiServer}`;

const vendorList = [
  'react',
  'react-dom',
  'redux',
  'react-redux',
  'react-router',
  'react-router-redux',
  'react-router-scroll',
  'react-tap-event-plugin',
  'redux-connect',
  'redux-thunk',
  'superagent',
  'classnames',
  'pouchdb',
];

const fileTests = {
  js: /\.js$/,
  css: /\.css$/,
  sass: /\.(scss|sass)$/,
  img: /\.(jpg|png|gif|svg|ico)$/,
};

export {
  host,
  context,
  rootPath,
  fileTests,
  embedLimit,
  vendorList,
  assetsPath,
  publicPathDev,
  publicPathProd,
  assetServerPort,
  serverBuildPath,
  relativeAssetsPath,
  relativeApiServerBuildPath,
  relativeAppServerBuildPath,
};
