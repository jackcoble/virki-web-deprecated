import * as localForage from "localforage";

/*
As Virki is an offline first application, we need a reliable database we can use in the browser.
For this, we can make use of IndexedDB - which we use LocalForage to help us with!
*/
const DB_NAME = "virki";

// getDB should return an existing database for us, or create one if it doesn't exist.
export const getDB = async (): Promise<LocalForage> => {
    const db = localForage.createInstance({
        name: DB_NAME,
        version: 1.0,
        driver: localForage.INDEXEDDB
    });

    return db;
}

// insertVault should add a vault into the database, or update an existing one if it happens
// to have the same ID.
export const insertVault = async (vault: any) => {
    const db = await getDB();
    
    // Put into the DB
    await db.setItem(vault.id, vault);
}