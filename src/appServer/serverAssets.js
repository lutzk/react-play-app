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

const getAssetsFromStats = (stats) => {

  const assetsObj = {};
  const publicPath = stats.publicPath;
  const assetsChunks = stats.assetsByChunkName;
  const assetsChunksKeys = Object.keys(assetsChunks);
  const assetsChunksLength = assetsChunksKeys.length;

  const loopChunkKeys = (index) => {
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

const formatAssets = (assetsObj) => {

  if (assetsObj.js !== undefined && assetsObj.js.vendor !== undefined && assetsObj.js.main !== undefined) {
    const formatedAssetsObj = JSON.parse(JSON.stringify(assetsObj));
    formatedAssetsObj.js = { // eslint-disable-line
      manifest: assetsObj.js.manifest,
      vendor: assetsObj.js.vendor,
      main: assetsObj.js.main,
    };
    return formatedAssetsObj;
  }

  return assetsObj;
};

export {
  formatAssets,
  getAssetsFromStats,
};
