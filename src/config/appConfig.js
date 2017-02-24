const env = {
  development: {
    isProduction: false,
  },
  production: {
    isProduction: true,
  },
}[process.env.NODE_ENV || 'development'];

const appConfig = Object.assign(
  {
    host: process.env.HOST,
    port: process.env.PORT,
    ssrAssetsRoute: process.env.SSR_ASSETS_ROUTE,
    devAssetServerPort: process.env.DEV_ASSETS_SERVER_PORT || 3011,
    app: {
      title: 'app',
      meta: {
        charSet: 'utf-8',
      },
    },
  },
  env
);

export default appConfig;
