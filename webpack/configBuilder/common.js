import nodeExternals from 'webpack-node-externals';
import {
  host,
  context,
  vendorList,
  assetsPath,
  publicPathDev,
  publicPathProd,
  serverBuildPath,
  assetServerPort,
} from '../settings';

// base
const baseConfig = {
  context,
  performance: false,
  // performance: { hints: true }
};

const getServerEntry = kind => ({
  [`${kind}Server`]: [`${kind}ServerEntry.js`],
});

const clientEntry = {
  vendor: vendorList,
  main: [
    'app/theme/styles/main.sass',
    'app/client.js',
  ],
};

const hmrSource = `webpack-hot-middleware/client?path=http://${host}:${assetServerPort}/__webpack_hmr&reload=true`;
const clientDevHMR = [
  'react-hot-loader/patch',
  hmrSource,
];

// output
const serverOutput = {
  path: serverBuildPath,
  filename: '[name].js',
  libraryTarget: 'commonjs2',
};

const clientOutput = {
  path: assetsPath,
  publicPath: publicPathDev,
  filename: '[name]-[chunkhash].js',
  chunkFilename: '[name]-[chunkhash].js',
};

const clientDevFilename = {
  filename: '[name].js',
  chunkFilename: '[name].js',
};

const getClientOutput = prod => prod ?
  clientOutput
  : { ...clientOutput, ...clientDevFilename };

// server
const targetNode = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()],
};

const extensions = ['.js'];
const assetsExtensions = ['.css', '.scss', '.sass'];
const resolve = {
  modules: [
    'src',
    'node_modules',
  ],
  extensions,
};

const buildOutput = ({ server = false, prod = false } = {}) => ({
  ...(() => server ? serverOutput : getClientOutput(prod))(),
  publicPath: prod ? publicPathProd : publicPathDev,
});

const buildResolve = ({ api = false, prod = false } = {}) => api ?
  resolve
  : { ...resolve, extensions: [...extensions, ...assetsExtensions] };

const buildEntry = ({ server = false, prod = false, api = false } = {}) => {
  let entry;
  if (server) {
    entry = getServerEntry(api ? 'api' : 'app');
  } else {
    entry = prod ? clientEntry : { ...clientEntry, ...clientEntry.main.unshift(...clientDevHMR) };
  }
  return entry;
};

export {
  baseConfig,
  targetNode,
  buildEntry,
  buildOutput,
  buildResolve,
};
