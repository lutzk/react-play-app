import { Action, AnyAction } from 'redux';
import { spirit } from '../modules/shared/shared';
import { PATHS_TYPES } from './nav';

export interface RoverPayload {
  rover: string;
}

export interface SolPayload {
  sol: number;
}

export interface NavAction extends AnyAction {
  type: PATHS_TYPES;
  payload?: RoverPayload | SolPayload;
}

const createLinkType = (
  type: PATHS_TYPES,
  payload?: RoverPayload | SolPayload,
): NavAction => ({
  type,
  payload,
});

const linkToHome = createLinkType(PATHS_TYPES.HOME);
const linkToLogin = createLinkType(PATHS_TYPES.LOGIN);
const linkToSpirit = createLinkType(PATHS_TYPES.ROVER_VIEW, {
  rover: spirit.name,
});

const createSolLink = (payload: SolPayload) =>
  createLinkType(PATHS_TYPES.SOL_VIEW, payload);

const createRoverLink = (payload: RoverPayload) =>
  createLinkType(PATHS_TYPES.ROVER_VIEW, payload);

export {
  linkToHome,
  linkToSpirit,
  createSolLink,
  linkToLogin,
  createRoverLink,
};
