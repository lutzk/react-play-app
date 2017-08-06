import webpack from 'webpack';
import CleanPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import SWPrecache from 'sw-precache-webpack-plugin';
import NameAllModulesPlugin from 'name-all-modules-plugin';

import StatsPlugin from '../plugins/statsPlugin';
import HashChunkNamesPlugin from '../plugins/HashChunkNamesPlugin';
import HashAllModulesNamesPlugin from '../plugins/HashAllModulesNamesPlugin';

import { rootPath, relativeAppServerBuildPath, relativeApiServerBuildPath, relativeAssetsPath, ExtractCssChunks } from '../settings';

const namedChunksPlugin = new webpack.NamedChunksPlugin();
const nameAllModulesPlugin = new NameAllModulesPlugin();
const hashChunkNamesPlugin = new HashChunkNamesPlugin();
const hashAllModulesNamesPlugin = new HashAllModulesNamesPlugin();
const hashedModuleIdsPlugin = new webpack.HashedModuleIdsPlugin();
const moduleConcatenationPlugin = new webpack.optimize.ModuleConcatenationPlugin();

const analyzerPlugin = new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  defaultSizes: 'parsed',
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: 'stats.json',
  statsOptions: null,
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

const buildCommonChunksPlugin = (prod) => {
  const vendor = {
    name: 'vendor',
    filename: prod ? '[name]-[chunkhash].js' : '[name].js',
    minChunks(module, count) {
      const ctx = module.context;
      return ctx && ctx.indexOf('node_modules') > -1;
    },
  };

  const runtime = {
    name: 'runtime',
  };

  return [
    new webpack.optimize.CommonsChunkPlugin(vendor),
    new webpack.optimize.CommonsChunkPlugin(runtime),
  ];
};

const namedModulesPlugin = new webpack.NamedModulesPlugin();
const hmrPlugin = new webpack.HotModuleReplacementPlugin();
const statsPlugin = new StatsPlugin();
const caseSensitivePathsPlugin = new CaseSensitivePathsPlugin();
const limitChunkCountPlugin = new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 });

const extractTextPlugin = new ExtractTextPlugin({
  filename: '[name]-[hash].css',
  disable: false,
  allChunks: true,
});

const loaderOptions = new webpack.LoaderOptionsPlugin({
  minimize: false,
  debug: false,
});

const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
  beautify: false,
  sourceMap: false,
  compress: {
    warnings: false,
    screw_ie8: true,
    conditionals: true,
    unused: true,
    comparisons: true,
    sequences: true,
    dead_code: true,
    evaluate: true,
    if_return: true,
    join_vars: true,
  },
  // mangle: {
  //   screw_ie8: true,
  //   props: {
  //     // regex: /^(refreshManifest|handleRefreshManifestRequest|loading|handleRangeUpdate|handleUpdateFilter|sorts|fields|missionStats|photoManifest|reducerName|listLength|roverName|listToRender|initialCount|solsToRender|updateList|handleSort)$/,
  //     debug: 'DEBUG9',
  //   },
  // },
  output: {
    comments: false,
  },
  comments: false,
});

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

const buildServerPlugins = ({ prod = false, api = false }) => {
  let serverPlugins;
  const base = [
    namedChunksPlugin,
    nameAllModulesPlugin,
    ...(prod ? [] : [hmrPlugin]),
    limitChunkCountPlugin,
    caseSensitivePathsPlugin,
    buildEnvPlugin({ server: true, prod }),
    createCleanPlugin(api ? relativeApiServerBuildPath : relativeAppServerBuildPath),
  ];

  const prodPlugins = [
    uglifyPlugin,
    moduleConcatenationPlugin,
    hashAllModulesNamesPlugin,
    hashChunkNamesPlugin,
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
    new ExtractCssChunks(),
    ...buildCommonChunksPlugin(prod),
    buildEnvPlugin({ prod }),
    caseSensitivePathsPlugin,
    analyzerPlugin,
    namedChunksPlugin,
    nameAllModulesPlugin,
  ];

  const prodPlugins = [
    swPrecachePlugin,
    statsPlugin,
    uglifyPlugin,
    moduleConcatenationPlugin,
    hashAllModulesNamesPlugin,
    hashChunkNamesPlugin,
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
    caseSensitivePathsPlugin,

  ];

  const prodPlugins = [
    uglifyPlugin,
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


export { buildPlugins }; // eslint-disable-line
