import path from 'path';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';

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
  assetsPath,
  publicPathDev,
  publicPathProd,
  assetServerPort,
  serverBuildPath,
  ExtractCssChunks,
  relativeAssetsPath,
  relativeApiServerBuildPath,
  relativeAppServerBuildPath,
};
