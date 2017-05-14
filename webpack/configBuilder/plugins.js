import webpack from 'webpack';
import CleanPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import StatsPlugin from '../plugins/statsPlugin';
import { rootPath, relativeAppServerBuildPath, relativeApiServerBuildPath, relativeAssetsPath } from '../settings';

// const analyzerPlugin = new BundleAnalyzerPlugin({
//   // Can be `server`, `static` or `disabled`.
//   // In `server` mode analyzer will start HTTP server to show bundle report.
//   // In `static` mode single HTML file with bundle report will be generated.
//   // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
//   analyzerMode: 'static',
//   // Host that will be used in `server` mode to start HTTP server.
//   // analyzerHost: '127.0.0.1',
//   // Port that will be used in `server` mode to start HTTP server.
//   // analyzerPort: 8888,
//   // Path to bundle report file that will be generated in `static` mode.
//   // Relative to bundles output directory.
//   // reportFilename: 'report.html',
//   // Module sizes to show in report by default.
//   // Should be one of `stat`, `parsed` or `gzip`.
//   // See "Definitions" section for more information.
//   defaultSizes: 'parsed',
//   // Automatically open report in default browser
//   openAnalyzer: false,
//   // If `true`, Webpack Stats JSON file will be generated in bundles output directory
//   generateStatsFile: true,
//   // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
//   // Relative to bundles output directory.
//   statsFilename: 'stats.json',
//   // Options for `stats.toJson()` method.
//   // For example you can exclude sources of your modules from stats file with `source: false` option.
//   // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
//   statsOptions: null,
//   // Log level. Can be 'info', 'warn', 'error' or 'silent'.
//   logLevel: 'info',
// });

const buildCommonChunksPlugin = (prod) => {
  const options = {
    name: 'vendor',
    filename: prod ? '[name]-[chunkhash].js' : '[name].js',
    minChunks(module, count) {
      const ctx = module.context;
      if (ctx.indexOf('redux-connect') > -1) {
        console.log('___BPF__MODULE__', module.context);
      }
      return ctx && ctx.indexOf('node_modules') >= 0;
    },
    // minChunks: Infinity,
  };

  const manifestOptions = {
    name: 'manifest',
  };

  const asyncOptions = {
    async: true,
    children: true,
    // minChunks: 1,
    minChunks: Infinity,
    // minChunks(module, count) {
    //   const ctx = module.context;
    //   // node_modules/core-js
    //   return ctx && ctx.indexOf('redux-connect') >= 0 && ctx.indexOf('node_modules') >= 0;
    // },
  };

  return [
    new webpack.optimize.CommonsChunkPlugin(options),
    new webpack.optimize.CommonsChunkPlugin(asyncOptions),
    new webpack.optimize.CommonsChunkPlugin(manifestOptions),
  ];
};

const namedModulesPlugin = new webpack.NamedModulesPlugin();
const hmrPlugin = new webpack.HotModuleReplacementPlugin();
const statsPlugin = new StatsPlugin();
const caseSensitivePathsPlugin = new CaseSensitivePathsPlugin();
const limitChunkCountPlugin = new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 });

const nodeEnvDev = { 'process.env.NODE_ENV': JSON.stringify('development') };
const nodeEnvProd = { 'process.env.NODE_ENV': JSON.stringify('production') };

const extractTextPlugin = new ExtractTextPlugin({
  filename: '[name]-[hash].css',
  disable: false,
  allChunks: true,
});

const loaderOptions = new webpack.LoaderOptionsPlugin({
  minimize: true,
  debug: false,
});

const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
  beautify: false,
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
  mangle: {
    screw_ie8: true,
  },
  output: {
    comments: false,
  },
  comments: false,
});

const getNodeEnv = ({ prod = false }) => prod ? nodeEnvProd : nodeEnvDev;

const buildEnvPlugin = ({ server = false, prod = false } = {}) => {
  const envConf = {
    __CLIENT__: !server,
    __SERVER__: server,
    __DEVELOPMENT__: !prod,
    __DEVTOOLS__: !prod,
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
    namedModulesPlugin,
    ...(prod ? [] : [hmrPlugin]),
    limitChunkCountPlugin,
    caseSensitivePathsPlugin,
    buildEnvPlugin({ server: true, prod }),
    createCleanPlugin(api ? relativeApiServerBuildPath : relativeAppServerBuildPath),
  ];

  const prodPlugins = [
    uglifyPlugin,
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
    ...buildCommonChunksPlugin(prod),
    buildEnvPlugin({ prod }),
    caseSensitivePathsPlugin,
    // analyzerPlugin,
  ];

  const prodPlugins = [
    statsPlugin,
    uglifyPlugin,
    loaderOptions,
    extractTextPlugin,
    createCleanPlugin(relativeAssetsPath),
  ];

  if (prod) {
    plugins = [...base, ...prodPlugins];
  } else {
    plugins = [...base, hmrPlugin];
  }
  return plugins;
};

const buildPlugins = ({ server = false, prod = false, api = false } = {}) =>
  server ?
    buildServerPlugins({ prod, api })
    : buildClientPlugins({ prod });


export { buildPlugins }; // eslint-disable-line
