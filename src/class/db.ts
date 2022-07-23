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
    private accounts!: Table<IAccountDB>;
    private vaults!: Table<IVault>;
    private tokens!: Table<IToken>

    /**
     * Initialise encrypted key store for multiple accounts
     */
    constructor() {
        super("authoriser");
        this.version(1).stores({
            accounts: "++id, account, encryptedMasterKey",
            vaults: "v_id, name, description, icon, key, modified, created",
            tokens: "t_id, v_id, issuer, account, secret, icon, algorithm, type, duration, digits, offline, created, modified"
        })
    }

    /**
     * Insert an encrypted vault into IndexedDB for persistence.
     * @param vault - Encrypted vault object.
     */
    async insertVault(vault: IVault): Promise<void> {
        await this.vaults.put(vault);
    }

    /**
     * Retrieve an encrypted vault from IndexedDB by its ID.
     * @param id - Vault ID used to fetch encrypted version.
     * @returns {IVault | undefined}
     */
    async getVault(id: string): Promise<IVault | undefined> {
        const vault = await this.vaults.get(id);
        return Promise.resolve(vault);
    }

    /**
     * Retrieves an array of all encrypted vaults in IndexedDB.
     * @returns {IVault[]}
     */
    async getVaults(): Promise<IVault[]> {
        const vaults = await this.vaults.toArray();
        return Promise.resolve(vaults);
    }

    /**
     * Removes an encrypted vault from IndexedDB by its ID.
     * @param id - Vault ID to be deleted.
     * @returns {void}
     */
    async removeVault(id: string): Promise<void> {
        try {
            await this.vaults.delete(id);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}

export {
    AuthoriserDB
}

export type {
    IAccountDB
}