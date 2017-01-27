const fs = require('fs');
const path = require('path');
const host = 'localhost';
const port = parseInt(process.env.PORT, 10) + 1 || 3011;
const webpack = require('webpack');
const assetsPath = path.resolve(__dirname, '../static/dist');
const vendorChunkPlugin = require('webpack-vendor-chunk-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const isomorphicToolsConfig = require('./isomorphicToolsConfig')
const isomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const isomorphicTools = new isomorphicToolsPlugin(isomorphicToolsConfig('client'));

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

const embedLimit = 10240;

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  context: path.resolve(__dirname, '..'),
  performance: {
    hints: false
  },
  entry: {
    main: [
      'webpack-hot-middleware/client?path=http://' + host + ':' + port + '/__webpack_hmr',
      'theme/styles/main.sass',
      'client.js'
    ],
    'vendor': [
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
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: 'http://' + host + ':' + port + '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.js$/, exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelrc
          },
          { loader: 'eslint-loader' }
        ]
      },
      { 
        test: /\.css$/,
        use: 'style-loader',
        use: 'css-loader'
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              outputStyle: 'expanded'
            }
          }
        ]
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
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
    extensions: ['.json', '.js', '.jsx', '.css', '.scss', '.sass']
  },
  plugins: [
    new CaseSensitivePathsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name]-[hash].js',
      minChunks: Infinity
    }),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true,  // <-------- DISABLE redux-devtools HERE
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    isomorphicTools.development()
  ]
};
