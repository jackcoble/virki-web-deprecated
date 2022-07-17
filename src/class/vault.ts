import { Account, EncryptionType } from "./account";

// Details we expected the encrypted vault payload to have when decrypted
interface IVault {
    v_id: string;
    name: string;
    description?: string;
    icon?: string;
    offline: boolean | number // If device is offline, this should be a timestamp of when it went offline in UNIX time (ms)
    created: number;
}

class Vault extends Account {
    constructor(masterKey: string) {
        super(masterKey);
    }

    /**
     * Creates an encrypted vault object that can be used to submit to our API.
     * @param vaultDetails 
     * @param offline 
     * @returns 
     */
    async createEncryptedVaultObject(vaultDetails: IVault, offline?: boolean): Promise<IVault> {
        // Generate a UUID (v4), remove hyphens and prepend 'v' to indicate vault, and append with EncryptionType to
        // indicate the type of encryption we are using.
        let vaultId = window.crypto.randomUUID();
        vaultId = vaultId.replace(/-/g, "");
        vaultId = `v-${vaultId}-v${EncryptionType.OPENPGP}`;

        vaultDetails.v_id = vaultId;

        // Now that we've got an ID set, we can start to encrypt some elements of a vault individually
        // - Name
        // - Description
        // - Icon
        vaultDetails.name = await this.encryptData(vaultDetails.name);

        // Check that description and icon aren't empty or length is zero
        if (vaultDetails.description && vaultDetails.description.trim().length > 0) {
            vaultDetails.description = await this.encryptData(vaultDetails.description);
        }

        if (vaultDetails.icon && vaultDetails.icon.trim().length > 0) {
            vaultDetails.icon = await this.encryptData(vaultDetails.icon);
        }
       
        // If device is offline, set the offline timestamp as current device UNIX time (microseconds)
        const currentUnixMilliseconds = Math.floor(Date.now() * 1000);
        if (!!offline) {
            vaultDetails.offline = currentUnixMilliseconds;
        } else {
            vaultDetails.offline = false;
        }

        // Set the created time as current UNIX time
        vaultDetails.created = currentUnixMilliseconds;

        return Promise.resolve(vaultDetails);
    }

    /**
     * Decrypts an encrypted vault object
     * @param vault 
     */
    async decryptFromVaultObject(vault: IVault): Promise<IVault> {
        // We first need to parse the v_id (Vault ID) as it contains some information such as the encryption type we want to use.
        // At the moment we only use OpenPGP.js, but it's good to future-proof ourselves!
        const splitVaultID = vault.v_id.split("-");
        const encryptionType = parseInt(splitVaultID[2].substring(1));

        if (encryptionType) {
            switch (encryptionType) {
                // Decrypt using OpenPGP.js
                case EncryptionType.OPENPGP:
                    // The properties we are mainly interested in are Name, Description and Icon    
                    vault.name = await this.decryptData(vault.name);

                    if (vault.description) {
                        vault.description = await this.decryptData(vault.description);
                    }

                    if (vault.icon) {
                        vault.icon = await this.decryptData(vault.icon);
                    }

                    break;
            
                // We have no other encryption types, so something went wrong here...
                default:
                    return Promise.reject("Encryption type is not supported!");
            }
        } else {
            return Promise.reject("Could not determine encryption type!")
        }

        return Promise.resolve(vault);
    }

    // IndexedDB Methods
    // =================

    /**
     * Insert an encrypted vault payload to IndexedDB so we can use offline.
     * @param vault 
     */
     async saveToDB(vault: IVault): Promise<void> {
        await this.authoriserDB.vaults.put(vault);
    }

    /**
     * Fetches an array of all the encrypted vaults we have stored locally.
     * @returns 
     */
    async getAllFromDB(): Promise<IVault[]> {
        const vaults = await this.authoriserDB.vaults.toArray();
        return vaults;
    }
}

export {
    Vault
}

export type {
    IVault
}