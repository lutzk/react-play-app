const babelConfigBase = {
  // ignore: ['/node_modules/'],
  babelrc: false,
  cacheDirectory: true,
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      debug: true,
      // modules: false,
      // useBuiltIns: 'usage',
    }]
  ],
  plugins: [
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
  ],
};

const devPlugins = [
  'react-hot-loader/babel',
];

const appPlugins = [
  'universal-import',
];

const appPresets = [
  '@babel/preset-react',
];


const transformReactConstantElements = "transform-react-constant-elements";

const babelConfigApiServer = JSON.parse(JSON.stringify(babelConfigBase));
const babelConfigApp = JSON.parse(JSON.stringify(babelConfigBase));

babelConfigApp.presets.push(...appPresets);
babelConfigApp.plugins.push(...appPlugins);

const babelConfigClient = JSON.parse(JSON.stringify(babelConfigApp));
const babelConfigProdClient = JSON.parse(JSON.stringify(babelConfigApp));

const babelConfigServer = JSON.parse(JSON.stringify(babelConfigApp));
const babelConfigServerProd = JSON.parse(JSON.stringify(babelConfigApp));

babelConfigProdClient.plugins.push(transformReactConstantElements);
babelConfigServerProd.plugins.push(transformReactConstantElements);

babelConfigClient.plugins.push(...devPlugins);
babelConfigServer.plugins.push(...devPlugins);
console.log(JSON.stringify(babelConfigClient));
export {
  babelConfigServer,
  babelConfigClient,
  babelConfigApiServer,
  babelConfigServerProd,
  babelConfigProdClient,
};
