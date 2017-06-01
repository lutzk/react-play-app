import { configBuilder } from './configBuilder';
import { buildLoaders as rules } from './loaders';
import { buildPlugins as plugins } from './plugins';
import { buildEntry as entry, buildOutput as output, buildResolve as resolve, targetNode, targetWebworker } from './common';
import { context } from '../settings';

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
  }
  if (envConfig.server) {
    rawConfig.target = targetNode;
  } else {
    // rawConfig.recordsPath = `${context}/records.json`;
    // rawConfig.recordsInputPath = `${context}/inputRecords.json`;
    // rawConfig.recordsOutputPath = `${context}/outputRecords.json`;
  }

  if (!envConfig.prod) {
    rawConfig.devtool = 'eval';
  }
  // console.log(JSON.stringify(rawConfig, 0, 2));
  return configBuilder(rawConfig);
}
