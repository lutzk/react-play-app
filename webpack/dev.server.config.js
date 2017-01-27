const fs = require('fs');
const path = require('path');
const host = 'localhost';
const webpack = require('webpack');
const context = path.resolve(__dirname, '..');
const rootPath = process.cwd() + '/';
const embedLimit = 10240;
const assetsPath = path.resolve(__dirname, '../static/server/');
const CleanPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals')();
const vendorChunkPlugin = require('webpack-vendor-chunk-plugin');
const relativeAssetsPath = 'static/server/';
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const babelrc = {
  ignore: "/node_modules/",
  babelrc: false,
  presets: ["react", "es2015", "stage-0"],
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
  devtool: 'cheap-module-eval-source-map',
  context: context,
  performance: {
    hints: false
  },
  entry: {
    server: ['server.entry.js']
  },
  output: {
    path: assetsPath,
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
              emitFile: false,
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
              emitFile: false,
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
              emitFile: false,
              limit: embedLimit,
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
              limit: embedLimit
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanPlugin([relativeAssetsPath], {
      'root': rootPath
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
