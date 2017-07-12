import fs from 'fs';
import path from 'path';
import pathIsInside from 'path-is-inside';
import findRoot from 'find-root';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { embedLimit, fileTests, context, ExtractCssChunks } from '../settings';
import {
  babelConfigServer,
  babelConfigClient,
  babelConfigApiServer,
  babelConfigServerProd,
  babelConfigProdClient,
} from './babelConfig';

const locals = '/locals';
const urlLoader = 'url-loader';
const cssLoader = 'css-loader';
const sassLoader = 'sass-loader';
const styleLoader = 'style-loader';
const babelLoader = 'babel-loader';
const eslintLoader = 'eslint-loader';
const cssLoaderLocal = cssLoader + locals;

const setUse = (loader, options = false) =>
  !options ? { loader } : { loader, options };

const serverCssLoader = {
  test: fileTests.css,
  use: [setUse(cssLoaderLocal)],
};

const cssLoaderOptions = {
  importLoaders: 2,
  // modules: true,
  // localIdentName: '[name]__[local]--[hash:base64:5]'
};
const sassLoaderOptions = {
  outputStyle: 'compressed',
};

const devCssLoaderOptions = {
  ...cssLoaderOptions,
  sourceMap: true,
  // modules: true,
  // localIdentName: '[name]__[local]--[hash:base64:5]'
};

const devSassLoaderOptions = {
  ...sassLoaderOptions,
  sourceMap: true,
  outputStyle: 'expanded',
};

const buildExtractTextPluginLoader = ({ kind = 'css' }) => {
  const test = fileTests[kind];
  const options = { fallback: styleLoader };

  if (kind === 'css') {
    options.use = [styleLoader, cssLoader];
  } else if (kind === 'sass') {
    options.use = [
      setUse(cssLoader, cssLoaderOptions),
      setUse(sassLoader, sassLoaderOptions),
    ];
  }

  return {
    test,
    loader: ExtractTextPlugin.extract(options),
  };
};

const buildExtractCssChunksLoader = ({ kind = 'css' }) => {
  const test = fileTests[kind];
  const options = { /* fallback: styleLoader */ };

  if (kind === 'css') {
    options.use = [/* styleLoader, */ setUse(cssLoader, devCssLoaderOptions)];
  } else if (kind === 'sass') {
    options.use = [
      // styleLoader,
      setUse(cssLoader, devCssLoaderOptions),
      setUse(sassLoader, devSassLoaderOptions),
    ];
  }

  return {
    test,
    loader: ExtractCssChunks.extract(options),
  };
};

const buildServerSassLoader = (prod = false) => ({
  test: fileTests.sass,
  use: [
    setUse(cssLoaderLocal, prod ? cssLoaderOptions : devCssLoaderOptions),
    setUse(sassLoader, prod ? sassLoaderOptions : devSassLoaderOptions),
  ],
});

const buildClientSassLoader = (prod = false) => {
  const test = { test: fileTests.sass };
  let conf;

  if (!prod) {
    conf = buildExtractCssChunksLoader({ kind: 'sass' });
    // conf = {
    //   ...test,
    //   use: [
    //     setUse(styleLoader, { sourceMap: true }),
    //     setUse(cssLoader, devCssLoaderOptions),
    //     setUse(sassLoader, devSassLoaderOptions),
    //   ],
    // };
  } else {
    // conf = buildExtractTextPluginLoader({ kind: 'sass' });
    conf = buildExtractCssChunksLoader({ kind: 'sass' });
  }
  return conf;
};

const buildSassLoader = ({ server = false, prod = false } = {}) => {
  if (server) {
    return buildServerSassLoader(prod);
  }
  return buildClientSassLoader(prod);
};

const buildClientCssLoader = (prod = false) => {
  const test = { test: fileTests.css };
  let conf;

  if (!prod) {
    conf = buildExtractCssChunksLoader({ kind: 'css' });
    // conf = {
    //   ...test,
    //   use: [
    //     setUse(styleLoader, { sourceMap: true }),
    //     setUse(cssLoader, devCssLoaderOptions),
    //   ],
    // };
  } else {
    // conf = buildExtractTextPluginLoader({ kind: 'css' });
    conf = buildExtractCssChunksLoader({ kind: 'css' });
  }
  return conf;
};

const buildCssLoader = ({ server = false, prod = false } = {}) => {
  if (server) {
    return serverCssLoader;
  }
  return buildClientCssLoader(prod);
};

const buildImageLoader = ({ server = false, prod = false, api = false } = {}) => ({
  test: fileTests.img,
  use: [
    {
      loader: 'url-loader',
      options: {
        emitFile: !server,
        limit: embedLimit,
        name: prod ? '[name]-[hash].[ext]' : '[name].[ext]',
      },
    },
  ],
});

const getBabelConfig = ({ server = false, prod = false, api = false, worker = false } = {}) => {
  let babelConfig;
  if ((server && api) || worker) {
    babelConfig = babelConfigApiServer;
  } else if (server && !api) {
    babelConfig = prod ? babelConfigServerProd : babelConfigServer;
  } else {
    babelConfig = prod ? babelConfigProdClient : babelConfigClient;
  }

  return babelConfig;
};

/*

  http://2ality.com/2017/04/transpiling-dependencies-babel.html
  
*/
const jsTest = { test: fileTests.js };
const dirJs = path.resolve(process.cwd(), 'src');
const dirNodeModules = path.resolve(process.cwd(), 'node_modules');
/**
 * Find package.json for file at `filepath`.
 * Return `true` if it has a property whose key is `PROPKEY_ESNEXT`.
 */
function hasPkgEsnext(filepath) {
  const pkgRoot = findRoot(filepath);
  const packageJsonPath = path.resolve(pkgRoot, 'package.json');
  const packageJsonText = fs.readFileSync(packageJsonPath,
      {encoding: 'utf-8'});
  const packageJson = JSON.parse(packageJsonText);
  return {}.hasOwnProperty.call(packageJson, 'esnext')
    || {}.hasOwnProperty.call(packageJson, 'jsnext')
    || {}.hasOwnProperty.call(packageJson, 'module');
}
const buildJsLoader = ({ server = false, prod = false, api = false, worker = false } = {}) => ({
  ...jsTest,
  // exclude: /node_modules/,
  include: (filepath) => {
    return pathIsInside(filepath, dirJs) ||
      (pathIsInside(filepath, dirNodeModules) &&
      hasPkgEsnext(filepath));
  },
  use: [
    setUse(babelLoader, getBabelConfig({ server, prod, api, worker })),
    setUse(eslintLoader, { fix: true }),
  ],
});

const loaders = [
  buildJsLoader,
  buildCssLoader,
  buildSassLoader,
  buildImageLoader,
];

const buildLoaders = ({ server = false, prod = false, api = false, worker = false } = {}) =>
  (api || worker)
    ? [buildJsLoader({ server, prod, api, worker })]
    : loaders.map(loader =>
        loader({ server, prod, api }));

export { buildLoaders };
