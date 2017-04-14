const path = require('path');

const host = 'localhost';
const assetServerPort = parseInt(process.env.PORT, 10) + 1 || 3011;
const serverPort = parseInt(process.env.PORT, 10) || 3010;
const context = path.resolve(__dirname, '..');
const rootPath = process.cwd() + '/';
const webpackCommons = {
  host: host,
  serverPort: serverPort,
  assetServerPort: assetServerPort,
  context: context,
  rootPath: rootPath,
  publicPath: 'http://' + host + ':' + assetServerPort + '/dist/',
  publicProdPath: '/dist/assets/',
  assetsPath: path.resolve(__dirname, '../static/dist'),
  assetsProdPath: path.resolve(__dirname, '../static/dist/assets/'),
  embedLimit: 10240,
  serverPath: path.resolve(__dirname, '../bin/'),
  serverBuildPath: path.resolve(__dirname, '../bin/'),
  relativeServerBuildPath: 'bin/server.js',
  relativeAssetsPath: 'static/dist/',
  relativeServerPath: 'bin/',
  imageRegex: /\.(jpg|png|gif|svg|ico)$/,
  resolveExtensions: ['.json', '.js', '.css', '.scss', '.sass'],
  vendorList: [
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
    'pouchdb'
  ]
};

const assetsJsonPluginConfig = {
  webpack: {
    output: {
      path: webpackCommons.context,
    },
    context: webpackCommons.context,
    devServer: {
      publicPath: webpackCommons.publicPath,
    }
  },
  plugin: {
    silent: false,
    chunk_info_filename: 'webpack-assets.json'
  }
};

const assetsJsonPluginProdConfig = JSON.parse(JSON.stringify(assetsJsonPluginConfig));
assetsJsonPluginProdConfig.webpack.devServer.publicPath = webpackCommons.publicProdPath;

module.exports = {
  webpackCommons: webpackCommons,
  assetsJsonPluginConfig: assetsJsonPluginConfig,
  assetsJsonPluginProdConfig: assetsJsonPluginProdConfig
};
