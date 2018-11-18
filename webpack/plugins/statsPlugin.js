import { writeFileSync } from 'fs';

// // to compile getAssetsFromStats on the fly
// require('@babel/register')({
//   // ignore: ['/node_modules/'],
//   // babelrc: false,
//   presets: ['@babel/preset-env'],
// });

import { formatAssets } from '../../src/appServer/serverAssets.js';
import { getAssetsFromStats } from '../../src/appServer/serverAssets.js';

function StatsPlugin() {}

StatsPlugin.prototype.apply = function apply(compiler) {
  const outFile = 'webpack-assets.json'
  compiler.plugin('done', (stats) => {
    const assets = getAssetsFromStats(stats.toJson());
    const json = JSON.stringify(formatAssets(assets));
    writeFileSync(outFile, json);
    writeFileSync('./static/' + outFile, json);
  });
};

export default StatsPlugin;
