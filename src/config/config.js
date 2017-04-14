const env = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign(
  {
    host: process.env.HOST,
    port: process.env.PORT,
    ssrAssetsRoute: process.env.SSR_ASSETS_ROUTE,
    devAssetServerPort: process.env.DEV_ASSETS_SERVER_PORT || 3011
  },
  env
);
