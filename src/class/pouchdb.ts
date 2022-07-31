import PouchDB from "pouchdb-browser";
import type { IVault } from "./vault";

export class Database {
    private localDB: PouchDB.Database;
    private remoteDB: PouchDB.Database;

    constructor(access_token: string, remote_url: string) {
        this.localDB = new PouchDB("authoriserDB");

        this.remoteDB = new PouchDB(remote_url, {
            fetch: function(url, opts) {
                opts.headers.set("Authorization", `Bearer ${access_token}`);
                return PouchDB.fetch(url, opts);
            }
        });
    }

    /**
     * Inserts an encrypted vault into PouchDB.
     * @param vault 
     * @returns {boolean}
     */
    async addVault(vault: IVault): Promise<any> {
        try {
            const result = await this.localDB.put(vault);
        } catch (error) {
            return Promise.reject(error);
        }

        // Sync changes
        await this.localDB.sync(this.remoteDB);
    }
}