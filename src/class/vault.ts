import { EncryptionType } from "./cipher";
import { Crypto } from "./crypto";

// Details we expected the encrypted vault payload to have when decrypted
interface IVault {
    v_id: string;
    name: string;
    description?: string;
    icon?: string;
    key: string;
    modified:  number // If device is offline, this modified value will still be updated and then checked when the device is online again
    created: number;
}

class Vault {
    private masterKeyPair: any;
    
    constructor(masterPrivateKey: string, masterPublicKey: string) {
        this.masterKeyPair = {
            privateKey: masterPrivateKey,
            publicKey: masterPublicKey
        }
    }

    /**
     * Creates an encrypted vault object that can be used to submit to our API.
     * @param vault
     * @returns {IVault}
     */
    async createEncryptedVaultObject(vault: IVault): Promise<IVault> {
        // Create a new object that will contain our encrypted data
        const encryptedVault = Object.assign({}, vault);

        // Generate a UUID (v4), remove hyphens and prepend 'v' to indicate vault, and append with EncryptionType to
        // indicate the type of encryption we are using.
        // Only do this though if the vault doesn't have an ID already present.
        if (!vault.v_id) {
            let vaultId = window.crypto.randomUUID();
            vaultId = vaultId.replace(/-/g, "");
            vaultId = `v-${vaultId}-v${EncryptionType.XCHACHA20_POLY1305}`;

            encryptedVault.v_id = vaultId;
        }

        // Generate and set a symmetric encryption key, to be used for all items in a vault.
        const encryptionKey = await Crypto.generateSymmetricEncryptionKey();
        const encryptionKeyBuffer = await Crypto.fromBase64(encryptionKey);
        encryptedVault.key = encryptionKey;

        // Now that we've got an ID and encryption key set, we can start to encrypt some elements of a vault individually
        // - Name
        // - Description
        // - Icon
        encryptedVault.name = await Crypto.encrypt(await Crypto.fromString(vault.name), encryptionKeyBuffer);

        // Check vault description and icon aren't empty or length is zero
        if (vault.description && vault.description.trim().length > 0) {
            encryptedVault.description = await Crypto.encrypt(await Crypto.fromString(vault.description), encryptionKeyBuffer);
        }

        if (vault.icon && vault.icon.trim().length > 0) {
            encryptedVault.icon = await Crypto.encrypt(await Crypto.fromString(vault.icon), encryptionKeyBuffer);
        }
       
        // Update or set the modified timestamp as current device UNIX time (microseconds)
        const currentUnixMilliseconds = Math.floor(Date.now() * 1000);
        encryptedVault.modified = currentUnixMilliseconds;

        // Set the created time as current UNIX time if not already set
        if (!vault.created) {
            encryptedVault.created = currentUnixMilliseconds;
        }

        return Promise.resolve(encryptedVault);
    }

    /**
     * Decrypts an encrypted vault object
     * @param vault 
     */
    async decryptFromVaultObject(vault: IVault): Promise<IVault> {
        const decryptedVault = Object.assign({}, vault);

        // We first need to parse the v_id (Vault ID) as it contains some information such as the encryption type we want to use.
        // At the moment we only use OpenPGP.js, but it's good to future-proof ourselves!
        const splitVaultID = vault.v_id.split("-");
        const encryptionType = parseInt(splitVaultID[2].substring(1));

        if (encryptionType) {
            switch (encryptionType) {
                // Decrypt using OpenPGP.js
                case EncryptionType.OPENPGP:
                    // The properties we are mainly interested in are Name, Description and Icon    
                    decryptedVault.name = await this.decryptData(vault.name);

                    if (vault.description) {
                        decryptedVault.description = await this.decryptData(vault.description);
                    }

                    if (vault.icon) {
                        decryptedVault.icon = await this.decryptData(vault.icon);
                    }

                    return Promise.resolve(decryptedVault);
            
                // We have no other encryption types, so something went wrong here...
                default:
                    return Promise.reject("Encryption type is not supported!");
            }
        } else {
            return Promise.reject("Could not determine encryption type!")
        }
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
     * Deletes an encrypted vault from IndexedDB.
     * @param vaultId 
     */
    async deleteFromDB(vaultId: string): Promise<void> {
        await this.authoriserDB.vaults.delete(vaultId);
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