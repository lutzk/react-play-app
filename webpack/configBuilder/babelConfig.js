const babelConfigBase = {
  // ignore: ['/node_modules/'],
  babelrc: false,
  cacheDirectory: true,
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      debug: true,
      // modules: false,
      // useBuiltIns: 'usage',
    }]
    // '@babel/typescript',
  ],
  plugins: [
    'universal-import',
    ["transform-imports", {
      "lodash": {
          "transform": "lodash/${member}",
          "preventFullImport": true
      }
    }],
    'syntax-trailing-function-commas',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
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
  // ignore: ['/node_modules/'],
  // babelrc: false,
  presets: [['@babel/preset-env', {
    targets: {
      node: 'current',
    },
    debug: true,
    // modules: false,
    // useBuiltIns: 'usage',
  }]],
  
  'plugins': [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-export-default-from',
    // 'transform-runtime'
  ]
}


const transformReactConstantElements = "transform-react-constant-elements";

const babelConfigApiServer = JSON.parse(JSON.stringify(babelConfigApiBase));

const babelConfigClient = JSON.parse(JSON.stringify(babelConfigBase));
const babelConfigProdClient = JSON.parse(JSON.stringify(babelConfigBase));

const babelConfigServer = JSON.parse(JSON.stringify(babelConfigBase));
const babelConfigServerProd = JSON.parse(JSON.stringify(babelConfigBase));

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
