const babelConfigBase = {
  ignore: ['/node_modules/'],
  babelrc: false,
  presets: ['@babel/preset-react', /* 'stage-0-without-async' */ '@babel/preset-env'],
  plugins: [
    'universal-import',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-function-bind',
    // '@babel/plugin-proposal-decorators',
    // {
    //   // legacy: true,
    //   decoratorsBeforeExport: false,
    // },
  ],
};

const devPlugins = [
  'react-hot-loader/babel',
];

const babelConfigApiBase = {
  ignore: ['/node_modules/'],
  babelrc: false,
  presets: ['@babel/preset-env'],
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

babelConfigClient.plugins.push(...devPlugins);
babelConfigServer.plugins.push(...devPlugins);

export {
  babelConfigServer,
  babelConfigClient,
  babelConfigApiServer,
  babelConfigServerProd,
  babelConfigProdClient,
};
