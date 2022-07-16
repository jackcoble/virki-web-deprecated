import Dexie, { type Table } from "dexie";

// Interface for Dexie table
interface IAccountDB {
    id?: number;
    account: string;
    encryptedMasterKey: string;
}

interface IVaultDB {
    id: string;
    uid: string;
    data: string;
    created: string;
}

interface ITokenDB {
    id: string;
    uid: string;
    vaultId: string;
    data: string;
    created: string;
    modified: string;
}

class AuthoriserDB extends Dexie {
    accounts!: Table<IAccountDB>;
    vaults!: Table<IVaultDB>;
    tokens!: Table<ITokenDB>

    /**
     * Initialise encrypted key store for multiple accounts
     */
    constructor() {
        super("authoriser");
        this.version(1).stores({
            accounts: "++id, account, encryptedMasterKey",
            vaults: "id, uid, data, created",
            tokens: "id, uid, vaultId, data, created, modified"
        })
    }
}

export {
    AuthoriserDB
}

export type {
    IAccountDB,
    IVaultDB,
    ITokenDB
}