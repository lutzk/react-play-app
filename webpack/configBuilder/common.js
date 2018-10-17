import nodeExternals from 'webpack-node-externals';
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import fs from 'fs';
import path from 'path';
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
    'app/client.tsx',
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
const setServerOutput = ({ kind }) => ({
  path: serverBuildPath,
  filename: `${kind}Server.js`,
  libraryTarget: 'commonjs2',
});

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

const nodeFalse = {
  Buffer: false,
  __dirname: false,
  __filename: false,
  console: false,
  global: false,
  process: false,
};

const filteredNodeModules = fs.readdirSync(`${context}/node_modules`)
  .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x));

const targetNode = {
  target: 'node',
  externals: [
    // https://webpack.js.org/configuration/externals/#function
    (context, request, callback) => {
      if (
        filteredNodeModules.indexOf(request.split('/')[0]) > -1
        && request.indexOf('webpack/hot') === -1
      ) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ],
};

const targetWebworker = {
  target: 'webworker',
};

const extensions = [
      '.mjs',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.web.js',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx',
      ];
const assetsExtensions = ['.css', '.scss', '.sass'];

const resolve = {
  modules: [
    'src',
    'node_modules',
  ],
  mainFields: ['esnext', 'jsnext', 'browser', 'module', 'main'],
  extensions,
  plugins: [
      new TsconfigPathsPlugin({ configFile: './tsconfig.json' }),
    ],
};

const buildOutput = ({ server = false, prod = false, worker = false, api = false } = {}) => ({
  ...(() => {
    if (worker) {
      return getWorkerOutput(worker);
    }
    return server ? setServerOutput({ kind: api ? 'api' : 'app' }) : getClientOutput(prod);
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
    // entry = prod ? clientEntry : { ...clientEntry, ...clientEntry.main.unshift(...clientDevHMR) };
    entry = { ...clientEntry, ...clientEntry.main.unshift(...clientDevHMR) };
  }
  return entry;
};

export {
  nodeFalse,
  baseConfig,
  targetNode,
  buildEntry,
  buildOutput,
  buildResolve,
  targetWebworker,
};
