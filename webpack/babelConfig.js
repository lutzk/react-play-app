const babelConfigBase = {
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['react', 'es2015', 'stage-0'],
  plugins: [
    'transform-runtime',
    'react-hot-loader/babel',
    'syntax-dynamic-import',
    'transform-decorators-legacy'
  ]
};

const esModules = ['es2015', { modules: false }];
const devPlugins = [
  'react-transform',
  {
    transforms: [{
      transform: 'react-transform-catch-errors',
      imports: ['react', 'redbox-react']
    }]
  }
];

const babelConfigClient = JSON.parse(JSON.stringify(babelConfigBase));
const babelConfigProdClient = JSON.parse(JSON.stringify(babelConfigBase));

const babelConfigServer = JSON.parse(JSON.stringify(babelConfigBase));
const babelConfigServerProd = JSON.parse(JSON.stringify(babelConfigBase));

babelConfigClient.plugins.push(devPlugins);
babelConfigServer.plugins.push(devPlugins);
babelConfigServer.presets[1] = esModules;
babelConfigClient.presets[1] = esModules;
babelConfigProdClient.presets[1] = esModules;

module.exports = {
  babelConfigServer: babelConfigServer,
  babelConfigClient: babelConfigClient,
  babelConfigServerProd: babelConfigServerProd,
  babelConfigProdClient: babelConfigProdClient
};
