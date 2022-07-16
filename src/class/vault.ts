import { Account } from "./account";

// Details we expected the encrypted vault payload to have when decrypted
interface DecryptedVault {
    // Provided by the API
    id?: string;
    created?: string;

    // Provided by the client
    name: string;
    description?: string;
    icon?: string;
}

// What we expect a vault payload to look like after its encrypted/returned back from API
interface EncryptedVault {
    id: string;
    uid: string;
    data: string;
    created: string;
}

class Vault extends Account {
    constructor(masterKey: string) {
        super(masterKey);
    }

    async createEncryptedVaultObject(vaultDetails: DecryptedVault): Promise<EncryptedVault> {
        try {
            const vaultDetailsString = JSON.stringify(vaultDetails);
            const ev = await this.encryptData(vaultDetailsString);

            const encryptedVault = {
                data: ev
            } as EncryptedVault

            return Promise.resolve(encryptedVault);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    // IndexedDB Methods
    // =================

    /**
     * Insert an encrypted vault payload to IndexedDB so we can use offline.
     * @param vault 
     */
     async saveToDB(vault: EncryptedVault): Promise<void> {
        await this.authoriserDB.vaults.put({
            id: vault.id,
            uid: vault.uid,
            data: vault.data,
            created: vault.created
        });
    }

    /**
     * Fetches an array of all the encrypted vaults we have stored locally.
     * @returns 
     */
    async getAllFromDB(): Promise<EncryptedVault[]> {
        const vaults = await this.authoriserDB.vaults.toArray();
        return vaults;
    }
}

export {
    Vault
}

export type {
    DecryptedVault,
    EncryptedVault
}