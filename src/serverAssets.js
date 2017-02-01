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

const getAssets = () => {
  const assetsFilePath = './webpack-assets.json';
  let chunks = null;
  if (checkAssetsJsonPresent(assetsFilePath)) {
    chunks = parseAssetsJson(assetsFilePath);
    return Promise.resolve().then(() => { return chunks; });
  }

  return waitForFile(assetsFilePath).then(() => {
    chunks = parseAssetsJson(assetsFilePath);
    return chunks;
  });
};

export default getAssets;