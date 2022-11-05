import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStoragePouch, addPouchPlugin } from 'rxdb/plugins/pouchdb';
import { RxDBReplicationCouchDBPlugin } from 'rxdb/plugins/replication-couchdb';

// RxDB Plugins
addRxPlugin(RxDBReplicationCouchDBPlugin);

// PouchDB Plugins
import * as pouchDBAdapterIDB from "pouchdb-adapter-idb";
import * as pouchDBAdapterHTTP from "pouchdb-adapter-http";

addPouchPlugin(pouchDBAdapterIDB);
addPouchPlugin(pouchDBAdapterHTTP);

export class VirkiStorageService {
    // The Virki storage service uses RxDB and the CouchDB replication plugin
    // as an offline-first data store.
    private _database: any;

    /**
     * Returns a pre-configured instance of the Virki Storage Service class
     */
    static async build(): Promise<VirkiStorageService> {
        // Create the database connection
        const database = await createRxDatabase({
            name: "virkidb",
            storage: getRxStoragePouch('idb')
        });

        const virkiStorageService = new VirkiStorageService(database);
        return virkiStorageService;
    }

    /**
     * Initialises the storage service constructor
     */
    constructor(db: any) {
        this._database = db;
    }
}