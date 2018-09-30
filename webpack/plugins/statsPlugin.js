const fs = require('fs');

// to compile getAssetsFromStats on the fly
require('@babel/register')({
  // ignore: ['/node_modules/'],
  // babelrc: false,
  presets: ['@babel/preset-env'],
});

const formatAssets = require('../../src/appServer/serverAssets.js').formatAssets;
const getAssetsFromStats = require('../../src/appServer/serverAssets.js').getAssetsFromStats;

function StatsPlugin() {}

StatsPlugin.prototype.apply = function apply(compiler) {
  const outFile = 'webpack-assets.json'
  compiler.plugin('done', (stats) => {
    const assets = getAssetsFromStats(stats.toJson());
    const json = JSON.stringify(formatAssets(assets));
    fs.writeFileSync(outFile, json);
    fs.writeFileSync('./static/' + outFile, json);
  });
};

module.exports = StatsPlugin;
