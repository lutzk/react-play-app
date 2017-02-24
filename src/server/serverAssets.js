const fs = require('fs');
const waitForFile = require('universal-webpack/build/wait for file.js').default;

const parseAssetsJson = (path) => {
  let file = null;
  let assets = false;
  try {
    file = fs.readFileSync(path, 'utf-8');
  } catch (e) {
    console.error(`somethings wrong ${e}`);
  } finally {
    if (file) {
      assets = JSON.parse(file);
    }
  }
  return assets;
};

const checkAssetsJsonPresent = (path) => {
  let file = null;
  let found = null;
  try {
    file = fs.statSync(path, 'utf-8');
  } catch (e) {
    found = false;
    console.error(`no asset.json found ${e}`);
  } finally {
    if (file) {
      found = true;
    }
  }
  return found;
};

const getAssets = (path = false) => {
  const assetsFilePath = path || './webpack-assets.json';
  let assets = null;
  if (checkAssetsJsonPresent(assetsFilePath)) {
    assets = parseAssetsJson(assetsFilePath);
    return Promise.resolve().then(() => assets);
  }

  return waitForFile(assetsFilePath).then(() => {
    assets = parseAssetsJson(assetsFilePath);
    return assets;
  });
};

export const formatAssets = (assetsObj) => {
  if (assetsObj.javascript !== undefined && assetsObj.javascript.vendor !== undefined && assetsObj.javascript.main !== undefined) {
    assetsObj.javascript = {// eslint-disable-line
      vendor: assetsObj.javascript.vendor,
      main: assetsObj.javascript.main,
    };
  }
  return assetsObj;
};

export default getAssets;
