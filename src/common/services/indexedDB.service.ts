import type { Vault } from "@/common/interfaces/vault";
import { Dexie, type Table } from "dexie";

/*
As Virki is an offline first application, we need a reliable database we can use in the browser.
For this, we can make use of IndexedDB - which we use Dexie to help us with!
*/
const DB_NAME = "virki";
const DB_VERSION = 1;

export class IndexedDBService extends Dexie {
    // 'vaults' is added by Dexie when declaring the stores()
    // We just tell the typing system this is the case
    private vaults!: Table<Vault>

    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores({
            vaults: 'id'
        })
    }

    /**
     * Insert an encrypted vault into IndexedDB.
     * @param vault - Encrypted vault
     * @returns 
     */
    async addVault(vault: Vault): Promise<void> {
        try {
            await this.vaults.put(vault);
        } catch (e) {
            return Promise.reject(e)
        }
    }

    /**
     * Retrieve all of the encrypted vaults
     * @returns {Vault[]}
     */
    async getAllVaults(): Promise<Vault[]> {
        return await this.vaults.toArray();
    }
}