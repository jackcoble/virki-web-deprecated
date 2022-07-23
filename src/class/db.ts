import Dexie, { type Table } from "dexie";
import type { IAccount } from "./account";
import type { IToken } from "./token";
import type { IVault } from "./vault";

class AuthoriserDB extends Dexie {
    private accounts!: Table<IAccount>;
    private vaults!: Table<IVault>;
    private tokens!: Table<IToken>

    /**
     * Initialise encrypted key store for multiple accounts
     */
    constructor() {
        super("authoriser");
        this.version(1).stores({
            accounts: "uid, email, name, *password, *encrypted_master_keypair",
            vaults: "v_id, name, description, icon, key, modified, created",
            tokens: "t_id, v_id, issuer, account, secret, icon, algorithm, type, duration, digits, offline, created, modified"
        })
    }

    // ========
    // Accounts
    // ========
    /**
     * Inserts an account into IndexedDB for persistence.
     * @param account 
     */
    async insertAccount(account: IAccount): Promise<void> {
        await this.accounts.put(account);
    }

    /**
     * Retrieve an account from IndexedDB
     * @param uid - Optional UID parameter to fetch specific account.
     * @returns {IAccount}
     */
    async getAccount(uid?: string): Promise<IAccount> {
        // If we've been provided with a UID, do a lookup for that specific account
        if (uid) {
            const account = await this.accounts.get(uid);
            if (account) {
                return Promise.resolve(account);
            }

            return Promise.reject("No account for the provided UID was found!");
        }

        // Otherwise just get the first account
        const firstAccount = await this.accounts.toCollection().first();
        if (firstAccount) {
            return Promise.resolve(firstAccount);
        }

        return Promise.reject("No accounts were found on this device!");
    }

    // ======
    // Vaults
    // ======
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