import nodeExternals from 'webpack-node-externals';
import {
  host,
  context,
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

const getServerEntry = ({ kind, prod }) => ({ // eslint-disable-line
  [`${kind}Server`]: [
    ...(!prod ? ['webpack/hot/poll?1000'] : []),
    `${kind}ServerEntry.js`,
  ],
});

const clientEntry = {
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

const getWorkerEntry = ({ prod, worker }) => ({
  worker: `app/workers/${worker}Worker`,
  ...(!prod ? [hmrSource] : []),
});

// output
const serverOutput = {
  path: serverBuildPath,
  filename: '[name].js',
  libraryTarget: 'commonjs2',
};

const clientOutput = {
  path: assetsPath,
  publicPath: publicPathDev,
  filename: '[name].js',
  chunkFilename: '[name].js',
  // filename: '[name]-[chunkhash].js',
  // chunkFilename: '[name]-[chunkhash].js',
};

const getWorkerOutput = worker => ({
  path: `${context}/static/`,
  publicPath: publicPathDev,
  filename: `[name].${worker}.js`,
  chunkFilename: `[name].${worker}.js`,
  // filename: '[name]-[chunkhash].js',
  // chunkFilename: '[name]-[chunkhash].js',
});

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
  externals: [nodeExternals({
    whitelist: [/^webpack\/hot/],
  })],
};

const targetWebworker = {
  target: 'webworker',
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

const buildOutput = ({ server = false, prod = false, worker = false } = {}) => ({
  ...(() => {
    if (worker) {
      return getWorkerOutput(worker);
    }
    return server ? serverOutput : getClientOutput(prod);
  })(),
  publicPath: prod ? publicPathProd : publicPathDev,
});

const buildResolve = ({ api = false, prod = false, worker = false } = {}) => (api || worker) ?
  resolve
  : { ...resolve, extensions: [...extensions, ...assetsExtensions] };

const buildEntry = ({ server = false, prod = false, api = false, worker = false } = {}) => {
  let entry;
  if (worker) {
    entry = getWorkerEntry({ prod, worker });
  } else if (server) {
    entry = getServerEntry({ kind: api ? 'api' : 'app', prod });
  } else {
    entry = prod ? clientEntry : { ...clientEntry, ...clientEntry.main.unshift(...clientDevHMR) };
  }
  return entry;
};

export {
  targetWebworker,
  baseConfig,
  targetNode,
  buildEntry,
  buildOutput,
  buildResolve,
};
