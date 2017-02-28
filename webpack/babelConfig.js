const babelConfigBase = {
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['react', ['es2015', { modules: false }], 'stage-0'],
  plugins: [
    'transform-runtime',
    'syntax-dynamic-import',
    'transform-decorators-legacy'
  ]
};

const devPlugins = [
  'react-hot-loader/babel',
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

module.exports = {
  babelConfigServer: babelConfigServer,
  babelConfigClient: babelConfigClient,
  babelConfigServerProd: babelConfigServerProd,
  babelConfigProdClient: babelConfigProdClient
};
