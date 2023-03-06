import PouchDB from "pouchdb";
import { DocType } from "../enums/database";
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
        // Need to set document type, custom creation and updated dates
        vault.doctype = DocType.Vault;
        vault.createdAt = new Date().toISOString();
        vault.updatedAt = new Date().toISOString();

        try {
            await this._db.post(vault);
        } catch (e: any) {
            return Promise.reject(e);
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