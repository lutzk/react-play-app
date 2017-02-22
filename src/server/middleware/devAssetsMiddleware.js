import superagent from 'superagent';
import path from 'path';
import { formatAssets } from '../serverAssets';
import appConfig from '../../config/appConfig';

// copied from universal-webpack/chunks plugin.js
/* eslint-disable */
const filenameInfo = (json, assets_base_url) => {

  const assets_by_chunk = json.assetsByChunkName

  const assets_chunks =
  {
    javascript: {},
    styles: {}
  }

  // gets asset paths by name and extension of their chunk
  function get_assets(name, extension)
  {
    let chunk = json.assetsByChunkName[name]

    // a chunk could be a string or an array, so make sure it is an array
    if (!(Array.isArray(chunk)))
    {
      chunk = [chunk]
    }

    return chunk
      // filter by extension
      .filter(name => path.extname(name) === `.${extension}`)
      // adjust the real path (can be http, filesystem)
      .map(name => assets_base_url + name)
  }

  // for each chunk name ("main", "common", ...)
  Object.keys(assets_by_chunk).forEach(function(name)
  {
    // log.debug(`getting javascript and styles for chunk "${name}"`)

    // get javascript chunk real file path

    const javascript = get_assets(name, 'js')[0]
    // the second asset is usually a source map

    if (javascript)
    {
      // log.debug(` (got javascript)`)
      assets_chunks.javascript[name] = javascript
    }

    // get style chunk real file path

    const style = get_assets(name, 'css')[0]
    // the second asset is usually a source map

    if (style)
    {
      // log.debug(` (got style)`)
      assets_chunks.styles[name] = style
    }
  })

  return assets_chunks
}
/* eslint-enable */
const devAssetsMiddleware = () => {
  return (req, res, next) => {
    if (!global.__DEVELOPMENT__) {
      return next();
    }

    let devAssets = null;
    const assetsJsonPath = `http://${appConfig.host}:${appConfig.devAssetServerPort}${appConfig.ssrAssetsRoute}`;

    return superagent
      .get(assetsJsonPath)
      .then((r, err) => { // eslint-disable-line
        if (r) {
          const publicPath = r.body.publicPath;// || `http://${appConfig.host}:${appConfig.devAssetServerPort}dist/`;
          devAssets = filenameInfo(r.body, publicPath);
          if (!devAssets) {
            return res.status(500).send('no assets found for server render');
          }
          res.locals.devAssets = formatAssets(devAssets);
          return next();
        }
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
      })
      .catch((e) => {
        console.error(e);
        return res.status(500).send(e);
      });
  };
};

export default devAssetsMiddleware;
