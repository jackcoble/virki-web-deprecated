import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from 'rxdb/plugins/dexie';;

export class VirkiStorageService {
    // The Virki storage service uses RxDB as an offline-first data store.
    private _database: any;

    /**
     * Returns a pre-configured instance of the Virki Storage Service class
     */
    static async build(): Promise<VirkiStorageService> {
        // Create the database connection
        const database = await createRxDatabase({
            name: "virkidb",
            storage: getRxStorageDexie()
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