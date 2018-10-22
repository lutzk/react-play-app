import express from 'express';

import { apiProxy, couchProxy } from '../middleware/proxys';
import { apiBase, couchBase } from '../../config/appConfig';

const proxyRouter = express.Router();

proxyRouter.use(apiBase, apiProxy.proxy()).use(couchBase, couchProxy.proxy());

export { proxyRouter };
