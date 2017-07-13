const babelConfigBase = {
  ignore: '/node_modules/',
  // babelrc: false,
  presets: ['react', 'stage-0-without-async'],
  plugins: [
    // 'transform-runtime',
    'transform-decorators-legacy',
  ],
};

const devPlugins = [
  'react-hot-loader/babel',
  'dual-import',
  'react-transform',
  {
    transforms: [{
      transform: 'react-transform-catch-errors',
      imports: ['react', 'redbox-react']
    }]
  }
];

const devPluginsServer = [
  'react-hot-loader/babel',
  'dual-import',
  'react-transform',
  {
    transforms: [{
      transform: 'react-transform-catch-errors',
      imports: ['react', 'redbox-react']
    }]
  }
];

const babelConfigApiBase = {
  ignore: '/node_modules/',
  babelrc: false,
  'presets': ['stage-0-without-async'],
  // 'plugins': [
  //   'transform-runtime'
  // ]
}

const removePropTypes = [
  'transform-react-remove-prop-types',
  {
    mode: 'remove',
    removeImport: true,
    ignoreFilenames: ['node_modules'],
  },
];

const transformReactConstantElements = "transform-react-constant-elements";

const babelConfigApiServer = JSON.parse(JSON.stringify(babelConfigApiBase));

const babelConfigClient = JSON.parse(JSON.stringify(babelConfigBase));
const babelConfigProdClient = JSON.parse(JSON.stringify(babelConfigBase));

const babelConfigServer = JSON.parse(JSON.stringify(babelConfigBase));
const babelConfigServerProd = JSON.parse(JSON.stringify(babelConfigBase));

babelConfigProdClient.plugins.push(removePropTypes);
babelConfigServerProd.plugins.push(removePropTypes);

babelConfigProdClient.plugins.push(transformReactConstantElements);
babelConfigServerProd.plugins.push(transformReactConstantElements);

babelConfigClient.plugins.push(devPlugins);
babelConfigServer.plugins.push(devPlugins);

export {
  babelConfigServer,
  babelConfigClient,
  babelConfigApiServer,
  babelConfigServerProd,
  babelConfigProdClient,
};
