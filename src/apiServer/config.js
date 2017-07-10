const apiHost = 'localhost';
const apiPort = 3040;
const appPort = 3010;
const apiProtocol = 'http://';

const apiRootMount = '/api/v1';

const privateApiRootMount = '/private';
const slApi = '/auth';
const nasaApi = '/nasa';

const privateApiMount = `${privateApiRootMount}`;
const nasaApiMount = `${privateApiMount}${nasaApi}`;
const slMount = `${privateApiMount}${slApi}`;

// make switchable
const socket = '/tmp/api.sock';
const serverPath = `http+unix://${encodeURIComponent(socket)}`;
// const serverPath = `${apiProtocol}${apiHost}:${apiPort}`;
const apiPath = `${serverPath}${apiRootMount}`;

const privateApiPath = `${serverPath}${privateApiRootMount}`;

const nasaApiPath = `${privateApiPath}${nasaApi}`;
const slApiPath = `${privateApiPath}${slApi}`;
const slLoginPath = `${slApiPath}/login`;
const slRegisterPath = `${slApiPath}/register`;
const slRefreshPath = `${slApiPath}/refresh`;
const slLogoutPath = `${slApiPath}/logout`;

const offlineNasaPath = '/offline-nasa';
const solPath = '/sol';
const roverPath = '/rover';
const solRoute = `${solPath}/:sol`;
const roverRoute = `${roverPath}/:rover`;

const offlineSolRoute = `${offlineNasaPath}${roverRoute}${solRoute}`;
const offlineRoverRoute = `${offlineNasaPath}${roverRoute}`;

const offlineSolPath = `${nasaApiPath}${offlineNasaPath}`;
const offlineRoverPath = `${nasaApiPath}${offlineNasaPath}${roverPath}`;

const couchApi = '/sl-users';
const couchMount = `${privateApiMount}${couchApi}`;

const couchDBHost = '127.0.0.1';
const couchDBPort = 5984;
const couchRoute = '/couch';
const slCouchPath = `${couchDBHost}:${couchDBPort}`;
const couchDBPath = `${apiProtocol}${couchDBHost}:${couchDBPort}`;
const couchDBProxyPath = `${apiHost}:${appPort}${couchRoute}`;

const usersCouch = '/sl_users';
const usersCouchPath = `${couchDBPath}${usersCouch}`;

const couchDBApiPath = `${privateApiPath}${couchApi}`;

const sessionSecret = process.env.SESSION_SECRET || 'se__!cRat__}?';
const sessionTimeOut = (3600000 / 4);

const authTokenKey = 'x-authentication';

const nasaApiConfig = {
  key: 'DEMO_KEY',
  basePath: 'https://api.nasa.gov/mars-photos/api/v1/',
  manifestsPath: 'manifests/',
  nasaApiMount,
  offlineSolPath,
  offlineRoverPath,
  offlineSolRoute,
  offlineRoverRoute,
};

const sessionConfig = {
  name: 'session',
  secret: sessionSecret,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: sessionTimeOut,
    path: '/',
    // secure: false // set to true when https is enabled
  },
};

const corsConfig = {
  // origin: 'https://api.nasa.gov/',
  origin: '*',
  methods: ['GET, POST'],
};

const slConfig = {
  testMode: {
    noEmail: true,
    debugEmail: true,
  },
  security: {
    loginOnRegistration: true,
    sessionLife: sessionTimeOut / 1000,
  },
  dbServer: {
    protocol: apiProtocol,
    host: slCouchPath,
    user: 'test',
    password: 'test',
    userDB: 'sl_users',
    couchAuthDB: '_users',
  },
  userDBs: {
    defaultDBs: {
      private: ['sl_user'],
    },
  },
};

export {
  socket,
  apiPort,
  apiPath,
  slMount,
  slConfig,
  couchMount,
  corsConfig,
  couchDBPath,
  slLoginPath,
  slCouchPath,
  nasaApiMount,
  apiRootMount,
  authTokenKey,
  slLogoutPath,
  sessionConfig,
  nasaApiConfig,
  slRefreshPath,
  slRegisterPath,
  couchDBApiPath,
  usersCouchPath,
  couchDBProxyPath,
};
