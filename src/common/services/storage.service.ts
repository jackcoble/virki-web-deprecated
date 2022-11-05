import { createRxDatabase } from "rxdb";
import { getRxStoragePouch, addPouchPlugin } from 'rxdb/plugins/pouchdb';
import * as pouchDBAdpaterIDB from "pouchdb-adapter-idb";

addPouchPlugin(pouchDBAdpaterIDB);

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