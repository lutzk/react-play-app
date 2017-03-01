import fs from 'fs';
import { timer } from '../helpers/logTiming';

const parseAssetsJson = (_path) => {

  let json = false;
  let jsonFile = null;

  try {
    jsonFile = fs.readFileSync(_path, 'utf-8');
  } catch (e) {
    console.error(`somethings wrong: ${e}`);
  } finally {
    if (jsonFile) {
      json = JSON.parse(jsonFile);
    }
  }

  return json;
};

const isExtension = (file, ext) => {

  if (ext === `${file}`.substr(parseInt(`-${ext.length}`, 10))) {
    return true;
  }

  return false;
};

const getAssetExtension = (file) => {

  let extension = null;
  const extensions = ['js', 'css'];

  extensions.map((ext) => {
    if (isExtension(file, ext)) {
      extension = ext;
    }
    return extension;
  });

  return extension;
};


const defineUndefined = (def, what = {})  => def = def || what;// eslint-disable-line

export const getAssetsFromStats = (stats) => {

  const startTime = timer.start();

  const assetsObj = {};
  const publicPath = stats.publicPath;
  const assetsChunks = stats.assetsByChunkName;
  const assetsChunksKeys = Object.keys(assetsChunks);
  const assetsChunksLength = assetsChunksKeys.length;

  for (let index = 0; index < assetsChunksLength; index += 1) {
    const assetsChunkKey = assetsChunksKeys[index];
    let assets = assetsChunks[assetsChunkKey];

    if (!(Array.isArray(assets))) {
      assets = [assets];
    }

    assets.map((asset) => {
      const type = getAssetExtension(asset);
      assetsObj[type] = defineUndefined(assetsObj[type], {});
      assetsObj[type][assetsChunkKey] = defineUndefined(assetsObj[type][assetsChunkKey], []);
      assetsObj[type][assetsChunkKey].push(`${publicPath}${asset}`);
      return undefined;
    });
  }

  timer.stop(startTime, 'getAssetsFromStats');
  return assetsObj;
};

export const formatAssets = (assetsObj) => {

  if (assetsObj.js !== undefined && assetsObj.js.vendor !== undefined && assetsObj.js.main !== undefined) {
    const formatedAssetsObj = JSON.parse(JSON.stringify(assetsObj));
    formatedAssetsObj.js = { // eslint-disable-line
      vendor: assetsObj.js.vendor,
      main: assetsObj.js.main,
    };
    return formatedAssetsObj;
  }

  return assetsObj;
};

const getAssets = (options = { path: false, empty: false }) => {

  const { path, empty } = options;

  if (!empty) {
    const _path = path || `${process.cwd()}/webpack-assets.json`;
    const assets = parseAssetsJson(_path);

    if (assets) {
      return assets;
    }

    return {};
  }

  // in dev its served by webpack-dev-midleware
  // so assetsFilePath is just present in prod
  return {};
};

export default getAssets;
