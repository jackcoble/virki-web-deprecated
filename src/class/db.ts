import Dexie, { type Table } from "dexie";

// Interface for Dexie table
interface IAccountDB {
    id?: number;
    account: string;
    encryptedMasterKey: string;
}

export class AuthoriserDB extends Dexie {
    accounts!: Table<IAccountDB>;

    /**
     * Initialise encrypted key store for multiple accounts
     */
    constructor() {
        super("authoriser");
        this.version(1).stores({
            accounts: "++id, account, encryptedMasterKey"
        })
    }
}