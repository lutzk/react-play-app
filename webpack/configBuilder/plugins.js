import webpack from 'webpack';
import CleanPlugin from 'clean-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import SWPrecache from 'sw-precache-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import  os from 'os';
// import NameAllModulesPlugin from 'name-all-modules-plugin';
// import BabiliPlugin from 'babili-webpack-plugin';

import StatsPlugin from '../plugins/statsPlugin';

import {
  rootPath,
  relativeAppServerBuildPath,
  relativeApiServerBuildPath,
  relativeAssetsPath, 
  ExtractCssChunks,
} from '../settings';

const analyzerPlugin = new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  defaultSizes: 'parsed',
  openAnalyzer: false,
  generateStatsFile: false,
  // statsFilename: 'stats.json',
  // statsOptions: null,
  logLevel: 'info',
});

const swPrecachePlugin = new SWPrecache({
  cacheId: 'spirit',
  verbose: true,
  dontCacheBustUrlsMatching: /./,
  staticFileGlobs: [
    '/',
    './static/dist/assets/vendor-*.js',
    './static/dist/assets/main-*.js',
    './static/dist/assets/main-*.css',
    './static/dist/assets/*.jpg',
  ],
  // error when import because that compilation has target web so globals are not as expected
  // doing it manualy
  // importScripts: [{ chunkName: 'pouchSW' }],
  stripPrefix: './static', // stripPrefixMulti is also supported
  filepath: './static/worker.js',
  // urlPattern: /this\\.is\\.a\\.regex/,
  // dynamicUrlToDependencies
  // runtimeCaching: [{
  //   urlPattern: /^\/api/,
  //   handler: 'cacheFirst',
  // },
  // {
  //   urlPattern: /^\/couch/,
  //   handler: 'cacheFirst',
  // }],
});

const hmrPlugin = new webpack.HotModuleReplacementPlugin();
const statsPlugin = new StatsPlugin();
const caseSensitivePathsPlugin = new CaseSensitivePathsPlugin();
const limitChunkCountPlugin = new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 });

const loaderOptions = new webpack.LoaderOptionsPlugin({
  minimize: false,
  debug: false,
});

// const babiliPlugin = new BabiliPlugin({
//   removeDebugger: true,
// }, {
//     comments: false,
//   }, {
//     sourceMap: false,
//   });

const nodeEnvDev = { 'process.env.NODE_ENV': JSON.stringify('development') };
const nodeEnvProd = { 'process.env.NODE_ENV': JSON.stringify('production') };
const getNodeEnv = ({ prod = false }) => prod ? nodeEnvProd : nodeEnvDev;

const getClientEnv = server => !server ?
  ({
    'process.env.HOST': JSON.stringify(process.env.HOST),
    'process.env.PORT': JSON.stringify(process.env.PORT),
    'process.env.API_BASE': JSON.stringify(process.env.API_BASE),
    'process.env.SSR_ASSETS_ROUTE': JSON.stringify(''),
    'process.env.DEV_ASSETS_SERVER_PORT': JSON.stringify(''),
  })
  : {};

const buildEnvPlugin = ({ server = false, prod = false } = {}) => {
  const envConf = {
    __CLIENT__: !server,
    __SERVER__: server,
    __DEVELOPMENT__: !prod,
    __DEVTOOLS__: !prod,
    ...getClientEnv(server),
    ...getNodeEnv({ prod }),
  };
  const envPlugin = new webpack.DefinePlugin(envConf);
  return envPlugin;
};

const createCleanPlugin = path => new CleanPlugin([path], {
  root: rootPath,
});

const cpus = os.cpus().length - 1;
const buildForkTsCheckerWebpackPlugin = (
  tsconfig = './tsconfig.json',
  watch = './src'
) => new ForkTsCheckerWebpackPlugin({
  async: true,
  watch,
  // workers: cpus,
  memoryLimit: 4096,
  tsconfig,
  tslint: './tslint.json',
});

const buildServerPlugins = ({ prod = false, api = false }) => {
  let serverPlugins;
  const base = [
    // buildForkTsCheckerWebpackPlugin(),
    ...(prod ? [] : [hmrPlugin]),
    // analyzerPlugin,
    limitChunkCountPlugin,
    // caseSensitivePathsPlugin,
    buildEnvPlugin({ server: true, prod }),
    createCleanPlugin(api ? relativeApiServerBuildPath : relativeAppServerBuildPath),
  ];

  const prodPlugins = [
    // babiliPlugin,
    // moduleConcatenationPlugin,
    // hashAllModulesNamesPlugin,
    // hashChunkNamesPlugin,
    loaderOptions,
  ];

  if (prod) {
    serverPlugins = [...base, ...prodPlugins];
  } else {
    serverPlugins = base;
  }
  return serverPlugins;
};

const buildClientPlugins = ({ prod = false }) => {
  let plugins;
  const base = [
    // new ExtractCssChunks({ hot: true, reloadAll: true }),
    buildEnvPlugin({ prod }),
    // caseSensitivePathsPlugin,
    buildForkTsCheckerWebpackPlugin(),
    // analyzerPlugin,
    new webpack.ProgressPlugin(),
  ];

  const prodPlugins = [
    swPrecachePlugin,
    statsPlugin,
    // hashAllModulesNamesPlugin,
    // hashChunkNamesPlugin,
    loaderOptions,
    createCleanPlugin(relativeAssetsPath),
  ];

  if (prod) {
    plugins = [...base, ...prodPlugins];
  } else {
    plugins = [...base, hmrPlugin];
  }
  return plugins;
};

const buildWorkerPlugins = ({ prod = false, worker = false }) => {
  let plugins;
  const base = [
    limitChunkCountPlugin,
    buildEnvPlugin({ prod }),
    // caseSensitivePathsPlugin,
    // buildForkTsCheckerWebpackPlugin(),
    new webpack.ProgressPlugin(),
  ];

  const prodPlugins = [
    loaderOptions,
  ];

  if (prod) {
    plugins = [...base, ...prodPlugins];
  } else {
    plugins = [...base, hmrPlugin];
  }
  return plugins;
};

const buildPlugins = ({ server = false, prod = false, api = false, worker = false } = {}) =>
  (server || worker) ?
    (() => server ? buildServerPlugins({ prod, api }) : buildWorkerPlugins({ prod }))()
    : buildClientPlugins({ prod });


export { buildPlugins };
