const babelConfigServer = {
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['react', 'es2015', 'stage-0'],
  plugins: [
    'transform-runtime',
    'syntax-dynamic-import',
    'transform-decorators-legacy',
    ['react-transform', {
      transforms: [{
        transform: 'react-transform-catch-errors',
        imports: ['react', 'redbox-react']
      }]
    }]
  ]
};

const babelConfigServerProd = {
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['react', 'es2015', 'stage-0'],
  plugins: [
    'syntax-dynamic-import',
    'transform-decorators-legacy'
  ]
};

const babelConfigClient = {
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['react', ['es2015', { modules: false }], 'stage-0'],
  plugins: [
    'transform-runtime',
    'syntax-dynamic-import',
    'transform-decorators-legacy',
    ['react-transform', {
      transforms: [{
        transform: 'react-transform-catch-errors',
        imports: ['react', 'redbox-react']
      }]
    }]
  ]
};

const babelConfigProdClient = {
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['react', ['es2015', { modules: false }], 'stage-0'],
  plugins: [
    'syntax-dynamic-import',
    'transform-decorators-legacy'
  ]
};

module.exports = {
  babelConfigServer: babelConfigServer,
  babelConfigClient: babelConfigClient,
  babelConfigServerProd: babelConfigServerProd,
  babelConfigProdClient: babelConfigProdClient
};
