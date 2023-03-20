import type { Vault } from "@/common/interfaces/vault";
import { addRxPlugin, createRxDatabase, type RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

// Schemas
import accountSchema from "./schemas/accounts.json"
import vaultSchema from "./schemas/vaults.json";

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
            storage: getRxStorageDexie(),
            ignoreDuplicate: true
        });

        // Add collections to the database. We should introduce some type safety here with a schema
        await database.addCollections({
            vaults: {
                schema: vaultSchema
            },

            accounts: {
                schema: accountSchema
            }
        })

        const virkiStorageService = new VirkiStorageService(database);
        return Promise.resolve(virkiStorageService);
    }

    /**
     * Add an encrypted vault to the local database
     * @param vault - Encrypted vault
     * @returns 
     */
    async addVault(vault: Vault): Promise<void> {
        try {
            await this._db.collections.vaults.insert(vault)
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * Returns all encrypted vaults in the local database
     * @returns {Vault[]} - Array of encrypted vaults
     */
    async getVaults(): Promise<Vault[]> {
        const vaults: Vault[] = [];

        try {
            await this._db.collections.vaults.find().exec().then(documents => {
                documents.forEach(doc => {
                    const v = doc.toJSON() as Vault;
                    vaults.push(v);
                })
            })
        } catch (e) {
            return Promise.reject(e);
        }

        return Promise.resolve(vaults);
    }
}