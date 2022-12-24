import Dexie from "dexie";
import type { Vault } from "../interfaces/vault";

const DB_NAME = "virki_db";
const DB_VERSION = 1;

export class VirkiStorageService extends Dexie {
    // The Virki storage service uses IndexedDB (with Dexie as a wrapper) for an offline-first data store.
    // Specify the tables and the types they'll be storing.
    private _vaults!: Dexie.Table<Vault, string>; // Stores a vault with the Vault ID in string format acting as a PK
    private _files!: Dexie.Table<Blob, string>;

    /**
     * Initialises the storage service constructor
     */
    constructor() {
        super(DB_NAME);

        // Prepare the store
        this.version(DB_VERSION)
        .stores({
            _vaults: 'id',
            _files: ''
        })
    }

    /**
     * Inserts an encrypted copy of the vault to the local database
     * @param vault - Encrypted vault to be stored
     */
    async addVault(vault: Vault): Promise<void> {
        try {
            await this._vaults.put(vault, vault.id);
        } catch (e) {
            // TODO: Send error to Sentry/local debug log
            console.error(e);
            return Promise.reject("There was an error inserting vault into local DB!");
        }
    }

    /**
     * Retrieves all local copies of encrypted vaults on this device
     * @returns {Vault[]}
     */
    async getVaults(): Promise<Vault[]> {
        try {
            const vaults = await this._vaults.toArray();
            return Promise.resolve(vaults);
        } catch (e) {
            console.error(e);
            return Promise.reject("There was an error fetching vaults from local DB!");
        }
    }

    /**
     * Returns the contents of an encrypted vault - such as encryption key, name, description, image etc.
     * @param id - Vault ID
     * @returns 
     */
    async getVault(id: string): Promise<Vault> {
        return Promise.resolve({} as Vault);
    }

    /**
     * Delete a vault from the database
     * @param id - Vault ID for the vault to be removed from the local database
     */
    async deleteVault(id: string): Promise<void> {
        try {
            await this._vaults.delete(id);
        } catch (e) {
            console.error(e);
            return Promise.reject("There was an error deleting this vault from local DB!");
        }
    }

    async addAvatar(file: Blob): Promise<void> {
        try {
            await this._files.put(file, "avatar");
        } catch (e) {
            console.error(e);
            return Promise.reject("There was an error inserting Blob to local DB!");
        }
    }

    async getAvatar(): Promise<Blob | null> {
        try {
            const file = await this._files.get("avatar");
            if (!file) {
                return Promise.resolve(null)
            }

            return Promise.resolve(file);
        } catch (e) {
            return Promise.reject("There was an error retrieving avatar Blob from local DB!");
        }
    }
}