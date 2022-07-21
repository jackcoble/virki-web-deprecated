import Dexie, { type Table } from "dexie";
import type { IToken } from "./token";
import type { IVault } from "./vault";

// Interface for Dexie table
interface IAccountDB {
    id?: number;
    account: string;
    encryptedMasterKey: string;
}

class AuthoriserDB extends Dexie {
    accounts!: Table<IAccountDB>;
    vaults!: Table<IVault>;
    tokens!: Table<IToken>

    /**
     * Initialise encrypted key store for multiple accounts
     */
    constructor() {
        super("authoriser");
        this.version(1).stores({
            accounts: "++id, account, encryptedMasterKey",
            vaults: "v_id, name, description, icon, modified, created",
            tokens: "t_id, v_id, issuer, account, secret, icon, algorithm, type, duration, digits, offline, created, modified"
        })
    }
}

export {
    AuthoriserDB
}

export type {
    IAccountDB
}