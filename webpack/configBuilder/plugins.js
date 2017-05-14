import webpack from 'webpack';
import CleanPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

import StatsPlugin from '../plugins/statsPlugin';
import { rootPath, relativeAppServerBuildPath, relativeApiServerBuildPath, relativeAssetsPath } from '../settings';

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
