const config = require('./webpackCommons').webpackCommons;
const webpack = require('webpack');
const babelrc = require('./babelConfig').babelConfigClient;
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const hmrSource = `webpack-hot-middleware/client?path=http://${config.host}:${config.assetServerPort}/__webpack_hmr&reload=true`;
config.vendorList.unshift(hmrSource);

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  context: config.context,
  performance: {
    hints: false
  },
  entry: {
    vendor: config.vendorList,
    main: [
      'react-hot-loader/patch',
      hmrSource,
      'theme/styles/main.sass',
      'client.js'
    ]
  },
  output: {
    path: config.assetsPath,
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: config.publicPath
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
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
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
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
              limit: config.embedLimit,
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
              limit: config.embedLimit,
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
              limit: config.embedLimit,
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
              limit: config.embedLimit,
              mimetype: 'image/svg+xml'
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif|svg|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: config.embedLimit
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
      __DEVTOOLS__: true  // <-------- DISABLE redux-devtools HERE
    })
  ]
};
