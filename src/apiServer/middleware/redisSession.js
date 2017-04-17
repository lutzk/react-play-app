import { RedisClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

import { sessionConfig } from '../config';

const redisClient = new RedisClient(/* { socket: '/tmp/redis.sock' } */);
const RedisStore = connectRedis(session);

const redisOptions = {
  client: redisClient,
};

sessionConfig.store = new RedisStore(redisOptions);
sessionConfig.unset = 'destroy';

const redisSession = session(sessionConfig);

export default redisSession;
