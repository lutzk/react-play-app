import { UserState } from '../app/redux/modules/user';
import { PouchDB } from './customPouch';

export interface DocModel {
  _id: string;
  _rev?: string;
  state?: any;
  localId?: string;
}

export interface DBS {
  local: PouchDB.Database<DocModel>;
  remote: PouchDB.Database<DocModel>;
}

export type POUCH = PouchDB.Database<DocModel>;

const getDBS = (user: UserState): Promise<DBS> =>
  Promise.resolve({
    local: new PouchDB<DocModel>(`_localUser_${user.user.userId}`, {
      revs_limit: 50,
      auto_compaction: true,
    }),
    remote: new PouchDB<DocModel>(user.user.userDB),
  });

export { getDBS };
