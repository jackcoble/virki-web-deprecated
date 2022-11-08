import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from 'rxdb/plugins/dexie';import type { Vault } from "../interfaces/vault";
;

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

    /**
     * Inserts an encrypted copy of the vault to the local database
     * @param vault - Encrypted vault to be stored
     */
    async addVault(vault: Vault): Promise<void> {}

    /**
     * Returns the contents of an encrypted vault - such as encryption key, name, description, image etc.
     * @param id - Vault ID
     * @returns 
     */
    async getVault(id: string): Promise<Vault> {
        return Promise.resolve({} as Vault);
    }
}