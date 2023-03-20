import type { Vault } from "@/common/interfaces/vault";
import { addRxPlugin, createRxDatabase, type RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { VaultSchema } from "./storage.schema";

const DB_NAME = "virki_db";

export class VirkiStorageService {
    // The Virki storage service uses RxDB for a reactive and offline-first data store.
    private _db: RxDatabase;

    /**
     * Initialises the storage service constructor
     */
    constructor(db: RxDatabase) {
        this._db = db;
    }

    /**
     * Builder method to return instantiated Storage Service
     */
    static async build(): Promise<VirkiStorageService> {
        // If we're in development, we want to use the Development mode plugin
        if (process.env.NODE_ENV !== "production") {
            addRxPlugin(RxDBDevModePlugin);
        }

        // Create the database
        const database = await createRxDatabase({
            name: DB_NAME,
            storage: getRxStorageDexie()
        });

        // Add collections to the database. We should introduce some type safety here with a schema
        await database.addCollections({
            vaults: {
                schema: VaultSchema
            }
        })

        const virkiStorageService = new VirkiStorageService(database);
        return Promise.resolve(virkiStorageService);
    }
}