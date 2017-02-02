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
  assetsPath: path.resolve(__dirname, '../static/dist'),
  embedLimit: 10240,
  serverPath: path.resolve(__dirname, '../static/server/'),
  relativeAssetsPath: 'static/dist/',
  relativeServerPath: 'static/server/'
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
}

module.exports = {
  webpackCommons: webpackCommons,
  assetsJsonPluginConfig: assetsJsonPluginConfig
};
