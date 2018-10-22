// from nolanlawson / pokedex.org

import PouchDB from 'pouchdb-core';
import PouchdbAdapterIdb from 'pouchdb-adapter-idb';
import PouchdbAdapterHttp from 'pouchdb-adapter-http';
import PouchdbReplication from 'pouchdb-replication';

PouchDB.plugin(PouchdbAdapterIdb)
  .plugin(PouchdbAdapterHttp)
  .plugin(PouchdbReplication);

export { PouchDB };
