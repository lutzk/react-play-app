const strip = require('strip-loader');
const config = require('./webpackCommons').webpackCommons;
const webpack = require('webpack');
const babelrc = require('./babelConfig').babelConfigProdClient;
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsJsonPlugin = require('../node_modules/universal-webpack/build/chunks plugin.js').default;
const assetsJsonPluginConfig = require('./webpackCommons').assetsJsonPluginProdConfig;
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
  context: config.context,
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
    path: config.assetsProdPath,
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
          fallbackLoader: 'style-loader'
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
          fallbackLoader: 'style-loader'
        })
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
        // test: isomorphicTools.regular_expression('images'),
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
  // progress: true,
  resolve: {
    modules: [
      'src',
      'node_modules'
    ],
    extensions: ['.json', '.js', '.css', '.scss', '.sass']
  },
  plugins: [
    new AssetsJsonPlugin(assetsJsonPluginConfig.webpack, assetsJsonPluginConfig.plugin),
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
    new CleanPlugin([config.relativeAssetsPath], {
      root: config.rootPath
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
    })
    // new webpack.optimize.AggressiveMergingPlugin(),
  ]
};