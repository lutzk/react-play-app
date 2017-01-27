const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const strip = require('strip-loader');
const relativeAssetsPath = 'static/dist/assets/';
const assetsPath = path.join(relativeAssetsPath);
const rootPath = process.cwd() + '/';

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const vendorChunkPlugin = require('webpack-vendor-chunk-plugin');

const isomorphicToolsConfig = require('./isomorphicToolsConfig')
const isomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const isomorphicTools = new isomorphicToolsPlugin(isomorphicToolsConfig());

const embedLimit = 10240;
const babelrc = {
  ignore: "/node_modules/",
  babelrc: false,
  presets: ["react", ["es2015", { modules: false }], "stage-0"],
  plugins: [
    "transform-runtime",
    "syntax-dynamic-import",
    "transform-decorators-legacy",
    ["react-transform", {
        transforms: [{
            transform: "react-transform-catch-errors",
            imports: ["react", "redbox-react"]
          }
        ]
    }]
  ]
}
module.exports = {
  context: path.resolve(__dirname, '..'),
  entry: {
    main: [
      'theme/styles/main.sass',
      'client.js'
    ],
    vendor: [
      'react',
      'react-dom',
      'redux',
      'react-redux',
      'react-router',
      'react-router-redux',
      'react-router-scroll',
      'react-tap-event-plugin',
      'redux-connect',
      'redux-thunk',
      'superagent',
      'classnames',
      'lodash-es'
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/dist/assets/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: strip.loader('debug') },
          {
            loader: 'babel-loader',
            options: babelrc
          }
        ]
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          loader: [
            'style-loader',
            'css-loader'
          ],
          fallbackLoader: "style-loader"
        })
      },
      {
        test: /\.(scss|sass)$/,
        loader: ExtractTextPlugin.extract({
          loader: [
            {
              loader: 'css-loader',
              query: { importLoaders: 1 }
            },
            {
              loader: 'sass-loader',
              query: { outputStyle: 'compressed' }
            }
          ],
          fallbackLoader: "style-loader"
        })
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: embedLimit,
              mimetype: 'application/font-woff'
            }
          }
        ]
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: embedLimit,
              mimetype: 'application/font-woff'
            }
          }
        ]
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: embedLimit,
              mimetype: 'application/octet-stream'
            }
          }
        ]
      },
      // {
      //   test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      //   use: 'file-loader'
      // },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: embedLimit,
              mimetype: 'image/svg+xml'
            }
          }
        ]
      },
      {
        test: isomorphicTools.regular_expression('images'),
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: embedLimit
            }
          }
        ]
      }
    ]
  },
  // progress: true,
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
    extensions: ['.json', '.js', '.css', '.scss', '.sass']
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: true,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      mangle: { 
        props: { 
          regex: /_$/
        }
      },
      output: {
        comments: false
      },
    }),
    new CleanPlugin([relativeAssetsPath], {
      'root': rootPath
    }),
    new ExtractTextPlugin({
      filename: '[name]-[chunkhash].css',
      disable: false,
      allChunks: true
    }),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false,
      __DISABLE_SSR__: false,
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name]-[chunkhash].js',
      minChunks: Infinity
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    isomorphicTools
  ]
};
