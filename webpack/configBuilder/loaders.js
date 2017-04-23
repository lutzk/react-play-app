import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { embedLimit, fileTests } from '../settings';
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
  importLoaders: 1,
};
const sassLoaderOptions = {
  outputStyle: 'compressed',
};

const devCssLoaderOptions = {
  ...cssLoaderOptions,
  sourceMap: true,
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
    conf = {
      ...test,
      use: [
        setUse(styleLoader),
        setUse(cssLoader, devCssLoaderOptions),
        setUse(sassLoader, devSassLoaderOptions),
      ],
    };
  } else {
    conf = buildExtractTextPluginLoader({ kind: 'sass' });
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
    conf = {
      ...test,
      use: [
        setUse(styleLoader),
        setUse(cssLoader),
      ],
    };
  } else {
    conf = buildExtractTextPluginLoader({ kind: 'css' });
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

const getBabelConfig = ({ server = false, prod = false, api = false } = {}) => {
  let babelConfig;
  if (server && api) {
    babelConfig = babelConfigApiServer;
  } else if (server && !api) {
    babelConfig = prod ? babelConfigServerProd : babelConfigServer;
  } else {
    babelConfig = prod ? babelConfigProdClient : babelConfigClient;
  }

  return babelConfig;
};

const jsTest = { test: fileTests.js };
const buildJsLoader = ({ server = false, prod = false, api = false } = {}) => ({
  ...jsTest,
  exclude: /node_modules/,
  use: [
    setUse(babelLoader, getBabelConfig({ server, prod, api })),
    setUse(eslintLoader, { fix: true }),
  ],
});

const loaders = [
  buildJsLoader,
  buildCssLoader,
  buildSassLoader,
  buildImageLoader,
];

const buildLoaders = ({ server = false, prod = false, api = false } = {}) =>
  api
    ? [buildJsLoader({ server, prod, api })]
    : loaders.map(loader => 
        loader({ server, prod, api }));

export { buildLoaders };
