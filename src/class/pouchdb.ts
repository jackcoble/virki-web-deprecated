import type { Vault } from "@/models/vault";
import PouchDB from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";

PouchDB.plugin(PouchDBFind);

// Custom sync type
export enum SYNC_TYPE {
    LOCAL = 0, // Data remains on this device only
    CLOUD, // Cloud-hosted CouchDB server
    CUSTOM // Custom CouchDB server
}

export class Database {
    private syncType: SYNC_TYPE;
    private localDB: PouchDB.Database;
    private remoteDB: PouchDB.Database;

    constructor(sync_type: SYNC_TYPE, database_name: string, remote_url: string, access_token?: string) {
        // We are always going to initialise an "offline" database that is replicated to other sources.
        this.localDB = new PouchDB(database_name);
        this.syncType = sync_type;

        // If the CLOUD sync type is used, then we need to set a header on the remote database
        switch (this.syncType) {
            // Syncing to Authorisers own cloud server
            case SYNC_TYPE.CLOUD:
                // Make sure access token is provided
                if (!access_token) {
                    throw new Error("No access token provided!");
                }

                this.remoteDB = new PouchDB(`${remote_url}/${database_name}`, {
                    fetch: function(url, opts) {
                        opts.headers.set("Authorization", `Bearer ${access_token}`);
                        return PouchDB.fetch(url, opts);
                    }
                });

                break;

            // Syncing to a custom CouchDB server
            case SYNC_TYPE.CUSTOM:
                this.remoteDB = new PouchDB(remote_url);
                break;
        
            default:
                break;
        }
    }

    /**
     * Bi-directional sync between Local DB and Remote DB
     * @returns 
     */
    async synchronise(): Promise<any> {
        // We do not sync if the SYNC_TYPE is local
        if (this.syncType === SYNC_TYPE.LOCAL) {
            return;
        }
        
        try {
            await PouchDB.sync(this.localDB, this.remoteDB);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * Inserts an encrypted vault into PouchDB.
     * @param vault 
     * @returns {boolean}
     */
    async addVault(vault: Vault): Promise<any> {
        try {
            const result = await this.localDB.put(vault);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Removes an encrypted vault from PouchDB.
     * @param id - Vault ID to be removed from PouchDB.
     * @returns 
     */
    async removeVault(id: string): Promise<any> {
        try {
            // Lookup the document by ID and remove it
            const doc = await this.localDB.get(id);
            if (doc) {
                await this.localDB.remove(doc);
                return Promise.resolve();
            }
        } catch (error) {
            return Promise.reject(error);
        } 
    }

    /**
     * Retrieves all encrypted vaults out of PouchDB.
     * @returns {Vault[]}
     */
    async getVaults(): Promise<Vault[]> {
        try {
            const result = await this.localDB.find({
                selector: { 
                    type: "vault" 
                }
            })

            return Promise.resolve(result.docs as Vault[]);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Creates and maintains indexes for us to query on
     * @returns 
     */
    async createIndexes(): Promise<any> {
        try {
            const result = await this.localDB.createIndex({
                index: {
                    fields: ["type"]
                }
            })

            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
}