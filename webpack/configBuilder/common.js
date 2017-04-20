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
  performance: {
    hints: false,
  },
};

// entrys
const appServerEntry = {
  appServer: ['appServerEntry.js'],
};

const apiServerEntry = {
  apiServer: ['apiServerEntry.js'],
};

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
  filename: '[name]-[hash].js',
  chunkFilename: '[name]-[chunkhash].js',
};

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
  ...(() => server ? serverOutput : clientOutput)(),
  publicPath: prod ? publicPathProd : publicPathDev,
});

const buildResolve = ({ api = false, prod = false } = {}) => api ?
  resolve
  : { ...resolve, extensions: [...extensions, ...assetsExtensions] };

const buildEntry = ({ server = false, prod = false } = {}) => {
  let entry;
  if (server) {
    entry = appServerEntry;
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
