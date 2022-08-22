import type { Vault } from "@/types/vault";
import { Dexie, type Table } from "dexie";

/*
As Virki is an offline first application, we need a reliable database we can use in the browser.
For this, we can make use of IndexedDB - which we use Dexie to help us with!
*/
const DB_NAME = "virki";
const DB_VERSION = 1;

class IndexedDB extends Dexie {
    // 'vaults' is added by Dexie when declaring the stores()
    // We just tell the typing system this is the case
    vaults!: Table<Vault>

    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores({
            vaults: 'id'
        })
    }
}

// getDB should return an existing database for us, or create one if it doesn't exist.
export const getDB = (): IndexedDB => {
    return new IndexedDB();
}

// insertVault should add a vault into the database, or update an existing one if it happens
// to have the same ID.
export const insertVault = async (vault: Vault) => {
    const db = getDB();
    await db.vaults.put(vault);
}