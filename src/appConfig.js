// require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

const appConfig = Object.assign(
  {
    appName: 'advertiser-app',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3010,
    apiBasePath: '/api/v1',
    apiHost: process.env.API_HOST || '',
    apiPort: process.env.API_PORT || 3040,
    app: {
      title: 'app',
      meta: {
        charSet: 'utf-8'
      }
    }
  },
  environment
);

export default appConfig;
