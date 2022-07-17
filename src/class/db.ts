import Dexie, { type Table } from "dexie";
import type { Vault } from "./vault";

// Interface for Dexie table
interface IAccountDB {
    id?: number;
    account: string;
    encryptedMasterKey: string;
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
    vaults!: Table<Vault>;
    tokens!: Table<ITokenDB>

    /**
     * Initialise encrypted key store for multiple accounts
     */
    constructor() {
        super("authoriser");
        this.version(1).stores({
            accounts: "++id, account, encryptedMasterKey",
            vaults: "v_id, name, description, icon, offline, created",
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