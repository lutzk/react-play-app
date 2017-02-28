const fs = require('fs');

// to compile getAssetsFromStats on the fly
require('babel-register')({
  ignore: '/node_modules/',
  babelrc: false,
  presets: ['es2015']
});

const formatAssets = require('../src/server/serverAssets.js').formatAssets;
const getAssetsFromStats = require('../src/server/serverAssets.js').getAssetsFromStats;

function StatsPlugin(outFile, options) {
  this.outFile = outFile;
  this.options = options || {};
}

StatsPlugin.prototype.apply = function apply(compiler) {
  const outFile = this.outFile;
  const options = this.options;
  compiler.plugin('done', (stats) => {
    const assets = getAssetsFromStats(stats.toJson(options));
    fs.writeFileSync(outFile, JSON.stringify(formatAssets(assets)));
  });
};

module.exports = StatsPlugin;
