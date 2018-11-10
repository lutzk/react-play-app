
import fs from 'fs';
import path from 'path';
import pathIsInside from 'path-is-inside';
import findRoot from 'find-root';
import { embedLimit, fileTests, /* context, */ ExtractCssChunks } from '../settings';
import {
  babelConfigServer,
  babelConfigClient,
  babelConfigApiServer,
  babelConfigServerProd,
  babelConfigProdClient,
} from './babelConfig';

const locals = '/locals';
const cssLoader = 'css-loader';
const sassLoader = 'sass-loader';
const babelLoader = 'babel-loader';
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

const tsLoaderOptions = {
  transpileOnly: true,
};

const buildExtractCssChunksLoader = ({ kind = 'css', prod = false }) => {
  const test = fileTests[kind];
  const options = {};
  const cssLoaderUse = setUse(cssLoader, prod ? cssLoaderOptions : devCssLoaderOptions);
  const sassLoaderUse = setUse(sassLoader, prod ? sassLoaderOptions : devSassLoaderOptions);

  if (kind === 'css') {
    options.use = [ExtractCssChunks.loader, cssLoaderUse];
  } else if (kind === 'sass') {
    options.use = [ExtractCssChunks.loader, cssLoaderUse, sassLoaderUse];
  }

  return {
    test,
    use: options.use,
  };
};

const buildServerSassLoader = (prod = false) => ({
  test: fileTests.sass,
  use: [
    setUse(cssLoaderLocal, prod ? cssLoaderOptions : devCssLoaderOptions),
    setUse(sassLoader, prod ? sassLoaderOptions : devSassLoaderOptions),
  ],
});

const buildClientStylesLoader = (kind = 'css') =>
  buildExtractCssChunksLoader({ kind });

const buildServerStylesLoader = ({ kind = 'css', prod = false }) =>
  kind === 'css' ?
    serverCssLoader
    : buildServerSassLoader(prod);

const buildStylesLoader = (kind = 'css') => ({ server = false, prod = false } = {}) => {
  if (server) {
    return buildServerStylesLoader({ kind, prod });
  }

  return buildClientStylesLoader(kind);
};

const stylesChain = ['css', 'sass'];
const styleLoaders = stylesChain.map(style =>
  buildStylesLoader(style));

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
const tsTest = { test: fileTests.ts };
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
      { encoding: 'utf-8' });
  const packageJson = JSON.parse(packageJsonText);
  return {}.hasOwnProperty.call(packageJson, 'esnext')
    || {}.hasOwnProperty.call(packageJson, 'jsnext')
    || {}.hasOwnProperty.call(packageJson, 'module');
}

const buildJsLoader = ({ server = false, prod = false, api = false, worker = false } = {}) => ({
  ...tsTest,
  // exclude: /node_modules/,
  include: filepath =>
    pathIsInside(filepath, dirJs) ||
      (pathIsInside(filepath, dirNodeModules) &&
      hasPkgEsnext(filepath)),
  use: [
    setUse(babelLoader, getBabelConfig({ server, prod, api, worker })),
  ],
});

const loaders = [
  buildJsLoader,
  ...styleLoaders,
  buildImageLoader,
];

const buildLoaders = ({ server = false, prod = false, api = false, worker = false } = {}) =>
  (api || worker)
    ? [buildJsLoader({ server, prod, api, worker })]
    : loaders.map(loader => loader({ server, prod, api }));

export { buildLoaders };
