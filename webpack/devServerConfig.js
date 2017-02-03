const config = require('./webpackCommons').webpackCommons;
const webpack = require('webpack');
const rootPath = process.cwd() + '/';
const CleanPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals')();
const vendorChunkPlugin = require('webpack-vendor-chunk-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const babelrc = require('./babelConfig').babelConfigServer;

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  context: config.context,
  performance: {
    hints: false
  },
  entry: {
    server: ['server.entry.js']
  },
  output: {
    path: config.serverPath,
    filename: '[name].dev.js',
    chunkFilename: '[name]-[chunkhash].js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
    extensions: ['.json', '.js', '.jsx', '.css', '.scss', '.sass']
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals],
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
        use: [{ loader: 'css-loader/locals' }]
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          {
            loader: 'css-loader/locals',
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
              emitFile: false,
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
              emitFile: false,
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
              emitFile: false,
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
              emitFile: false,
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
              emitFile: false,
              limit: config.embedLimit
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    new CleanPlugin([config.relativeServerPath], {
      'root': config.rootPath
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: false,
      __SERVER__: true,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true
    })
  ]
};