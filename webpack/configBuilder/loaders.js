import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { embedLimit, fileTests } from '../settings';
import {
  babelConfigServer,
  babelConfigClient,
  // babelConfigApiServer,
  babelConfigServerProd,
  babelConfigProdClient,
} from './babelConfig';

const locals = '/locals';
const cssLoader = 'css-loader';
const sassLoader = 'sass-loader';
const styleLoader = 'style-loader';
const cssLoaderLocal = cssLoader + locals;

const serverCssLoader = {
  test: fileTests.css,
  use: [{ loader: cssLoaderLocal }],
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

const buildLoader = (loader, options = false) =>
  !options ? { loader } : { loader, options };

const buildExtractTextPluginLoader = ({ kind = 'css' }) => {
  const test = fileTests[kind];
  const options = { use: [], fallback: styleLoader };

  if (kind === 'css') {
    options.use.push(...[styleLoader, cssLoader]);
  } else if (kind === 'sass') {
    options.use.push(...[{
      loader: cssLoader,
      query: cssLoaderOptions,
    }, {
      loader: sassLoader,
      query: sassLoaderOptions,
    }]);
  }

  return {
    test,
    loader: ExtractTextPlugin.extract(options),
  };
};

const buildServerSassLoader = (prod = false) => ({
  test: fileTests.sass,
  use: [
    buildLoader(cssLoaderLocal, prod ? cssLoaderOptions : devCssLoaderOptions),
    buildLoader(sassLoader, prod ? sassLoaderOptions : devSassLoaderOptions),
  // {
  //   loader: cssLoaderLocal,
  //   options: prod ? cssLoaderOptions : devCssLoaderOptions,
  // },
  // {
  //   loader: sassLoader,
  //   options: prod ? sassLoaderOptions : devSassLoaderOptions,
  // }
  ],
});

const buildClientSassLoader = (prod = false) => {
  const test = { test: fileTests.sass };
  let conf;

  if (!prod) {
    conf = {
      ...test,
      use: [
        { loader: styleLoader },
        {
          loader: cssLoader,
          options: devCssLoaderOptions,
        },
        {
          loader: sassLoader,
          options: devSassLoaderOptions,
        },
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

// const buildServerCssLoader = () => ({
//   test: fileTests.css,
//   use: [{ loader: cssLoaderLocal }],
// });

const buildClientCssLoader = (prod = false) => {
  const test = { test: fileTests.css };
  let conf;

  if (!prod) {
    conf = {
      ...test,
      use: [
        { loader: styleLoader },
        { loader: cssLoader },
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

const buildImageLoader = ({ server = false } = {}) => ({
  test: fileTests.img,
  use: [
    {
      loader: 'url-loader',
      options: {
        emitFile: !server,
        limit: embedLimit,
        name: '[name]-[hash].[ext]',
      },
    },
  ],
});

const getBabelConfig = ({ server = false, prod = false } = {}) => {
  let babelConfig;
  if (server) {
    babelConfig = prod ? babelConfigServerProd : babelConfigServer;
  } else {
    babelConfig = prod ? babelConfigProdClient : babelConfigClient;
  }

  return babelConfig;
};

const jsTest = { test: fileTests.js };
const buildJsLoader = ({ server = false, prod = false } = {}) => ({
  ...jsTest,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader',
      options: getBabelConfig({ server, prod }),
    },
    {
      loader: 'eslint-loader',
      options: {
        fix: true,
      },
    },
  ],
});

const loaders = [
  buildJsLoader,
  buildCssLoader,
  buildSassLoader,
  buildImageLoader,
];

const buildLoaders = ({ server = false, prod = false } = {}) =>
  loaders.map(loader => 
    loader({ server, prod }));

export { buildLoaders };
