import { HOME, LOGIN, SOL_VIEW, ROVER_VIEW } from './nav';
import { spirit } from '../modules/shared/shared';

const createLinkType = (type, payload) => ({ type, payload });

const linkToHome = createLinkType(HOME);
const linkToLogin = createLinkType(LOGIN);
const linkToSpirit = createLinkType(ROVER_VIEW, { rover: spirit.name });

const createSolLink = payload => createLinkType(SOL_VIEW, payload);
const createRoverLink = payload => createLinkType(ROVER_VIEW, payload);

export {
  linkToHome,
  linkToSpirit,
  createSolLink,
  linkToLogin,
  createRoverLink,
  linkToHomer,
};
