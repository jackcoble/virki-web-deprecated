import type { Vault } from "@/models/vault";
import PouchDB from "pouchdb-browser";

export class Database {
    private localDB: PouchDB.Database;
    private remoteDB: PouchDB.Database;

    constructor(access_token: string, database_name: string, remote_host: string) {
        this.localDB = new PouchDB(database_name);
        this.remoteDB = new PouchDB(`${remote_host}/${database_name}`, {
            fetch: function(url, opts) {
                opts.headers.set("Authorization", `Bearer ${access_token}`);
                return PouchDB.fetch(url, opts);
            }
        });
    }

    /**
     * Bi-directional sync between Local DB and Remote DB
     * @returns 
     */
    async synchronise(): Promise<any> {
        try {
            await this.localDB.sync(this.remoteDB)
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
}