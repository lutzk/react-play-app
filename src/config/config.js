require('dotenv').load();
const config = {
  host: process.env.HOST,
  port: process.env.PORT,
  ssrAssetsRoute: process.env.SSR_ASSETS_ROUTE,
  devAssetServerPort: process.env.DEV_ASSETS_SERVER_PORT || 3011,
};

export { config };
