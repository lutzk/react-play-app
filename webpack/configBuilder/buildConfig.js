import { configBuilder } from './configBuilder';
import { buildLoaders as rules } from './loaders';
import { buildPlugins as plugins } from './plugins';
import { buildEntry as entry, buildOutput as output, buildResolve as resolve, targetNode } from './common';

export function buildConfig(env) {

  const rawConfig = {};
  const servers = ['apiServer', 'appServer'];
  const [prod, server] = env.split('.');
  const envConfig = {
    api: server === 'apiServer',
    prod: prod === 'prod',
    server: servers.indexOf(server) > -1,
  };

  const builders = { entry, rules, output, plugins, resolve };

  Object.keys(builders).map(key =>
      rawConfig[key] = builders[key](envConfig));

  if (envConfig.server) {
    rawConfig.target = targetNode;
  }

  if (!envConfig.server && !envConfig.prod) {
    rawConfig.devtool = 'eval';
  }

  return configBuilder(rawConfig);
}
