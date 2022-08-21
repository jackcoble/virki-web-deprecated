import Dexie from "dexie";

/*
As Virki is an offline first application, we need a reliable database we can use in the browser.
For this, we can make use of IndexedDB - which we use Dexie to help us with!
*/
const DB_NAME = "virki";

// Declare some types for the different tables
interface VaultsTable {
    id: string;
}

// getDB should return an existing database for us, or create one if it doesn't exist.
export const getDB = async (): Promise<any> => {
    const db = new Dexie(DB_NAME);
    db.version(1).stores({
        vaults: 'id'
    });

    return db;
}

// insertVault should add a vault into the database, or update an existing one if it happens
// to have the same ID.
export const insertVault = async (vault: any) => {
    const db = await getDB();
    
    // Put into the DB
    const id = await db.vaults.put({
        id: vault.id
    })

    return id;
}