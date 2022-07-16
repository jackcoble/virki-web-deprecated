import { Account } from "./account";

// Details we expected the encrypted vault payload to have when decrypted
interface DecryptedVault {
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
}

export {
    Vault
}