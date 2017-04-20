import { baseConfig } from './common';

const setRules = rules => ({ module: { rules } });
const setPlugins = plugins => ({ plugins });

const configBuilder = ({ entry, output, resolve, rules, plugins, target, devtool }) => ({
  entry,
  output,
  resolve,
  ...baseConfig,
  ...setRules(rules),
  ...setPlugins(plugins),
  ...target,
  devtool,
});

export { configBuilder };// eslint-disable-line
