import PouchDB from "pouchdb";
import type { Vault } from "../interfaces/vault";

const DB_NAME = "virki_db";

interface StorageService {
    add(vault: Vault): void;
    sync(server: string): void;
}

export class VirkiStorageService implements StorageService {
    // The Virki storage service uses PouchDB for an offline-first data store.
    // It is able to sync with CouchDB for cloud storage.
    private _db: PouchDB.Database;

    /**
     * Initialises the storage service constructor
     */
    constructor() {
        this._db = new PouchDB(DB_NAME);
    }

    /**
     * Inserts an encrypted copy of the vault to the local database
     * @param vault - Encrypted vault to be stored
     */
    async add(vault: Vault): Promise<void> {
        try {
            await this._db.put(vault);
        } catch (e) {
            // TODO: Send error to Sentry/local debug log
            console.error(e);
            return Promise.reject("There was an error inserting vault into local DB!");
        }
    }

    /**
     * Syncs the current database to a remote server
     * @param server - URL of the CouchDB server
     */
    async sync(server: string): Promise<void> {
        try {
            await this._db.sync(server);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}