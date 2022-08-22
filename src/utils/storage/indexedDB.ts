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

// getVault should retrieve data for a specific vault ID
export const getVault = async (id: string): Promise<Vault> => {
    const db = getDB();

    const vault = await db.vaults.get(id);
    if (!vault) {
        return Promise.reject("No vault found!");
    }

    return Promise.resolve(vault);
}

// getAllVaults should retrieve all vaults we have stored in the DB.
export const getAllVaults = async (): Promise<Vault[]> => {
    const db = getDB();
    return await db.vaults.toArray();
}

// deleteDBs should delete all databases
export const deleteDBs = async () => {
    const db = getDB();
    await db.delete();
}