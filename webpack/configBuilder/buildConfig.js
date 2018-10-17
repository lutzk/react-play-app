import { configBuilder } from './configBuilder';
import { buildLoaders as rules } from './loaders';
import { buildPlugins as plugins } from './plugins';
import {
  buildEntry as entry,
  buildOutput as output,
  buildResolve as resolve,
  nodeFalse, targetNode, targetWebworker,
} from './common';

export function buildConfig(env) {

  const rawConfig = {};
  const servers = ['apiServer', 'appServer'];
  const [prod, target, kind] = env.split('.');
  const envConfig = {
    api: target === 'apiServer',
    prod: prod === 'prod',
    server: servers.indexOf(target) > -1,
    worker: target === 'worker' && kind ? kind : false,
  };

  const builders = { entry, rules, output, plugins, resolve };
  Object.keys(builders).map(key =>
    rawConfig[key] = builders[key](envConfig));

  if (envConfig.worker) {
    rawConfig.target = targetWebworker;
    // to fix https://github.com/webpack/webpack/issues/4998
    // as otherwise there would be no global obj available
    rawConfig.node = nodeFalse;
    rawConfig.node.global = true;

  } else if (envConfig.server) {
    rawConfig.target = targetNode;
    rawConfig.name = 'server';
    rawConfig.mode = 'development';
    // rawConfig.recordsPath = `${context}server-records.json;
  } else {
    rawConfig.name = 'client';
    // setting all explictly false is ok
    // setting 'node = false' not
    // rawConfig.node = false;
    rawConfig.mode = 'development';
    rawConfig.node = nodeFalse;
    rawConfig.output.crossOriginLoading = 'anonymous';
    rawConfig.target = { target: 'web' };
    rawConfig.recordsPath = `${context}records.json`;
    rawConfig.optimization = {
      // FOR PRODUCTION
      // minimizer: [
      //     // new UglifyJSPlugin({
      //     //     uglifyOptions: {
      //     //         output: {
      //     //             comments: false,
      //     //             ascii_only: true
      //     //         },
      //     //         compress: {
      //     //             comparisons: false
      //     //         }
      //     //     }
      //     // })
      // ],
      // END
      // NEEDED BOTH IN PROD AND DEV BUILDS
      runtimeChunk: {
        name: 'bootstrap',
      },
      // splitChunks: {
      //   chunks: 'initial',
      //   cacheGroups: {
      //     vendors: {
      //       test: /[\\/]node_modules[\\/]/,
      //       name: 'vendors',
      //     },
      //   },
      // },
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 8,
        maxInitialRequests: 8,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: true,
            chunks: 'all',
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };
  }

  if (!envConfig.prod) {
    rawConfig.devtool = 'inline-source-map';
  }
  // console.log(JSON.stringify(rawConfig, 0, 2));
  return configBuilder(rawConfig);
}
