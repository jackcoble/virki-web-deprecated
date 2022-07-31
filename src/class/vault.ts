import { EncryptionType } from "./cipher";
import { Crypto } from "./crypto";
import type { Vault as VaultModel } from "@/models/vault";

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
     * @returns {VaultModel}
     */
    async createEncryptedVaultObject(vault: VaultModel, privateKey: string, publicKey: string): Promise<VaultModel> {
        // Create a new object that will contain our encrypted data
        const encryptedVault = Object.assign({}, vault);

        // Generate a UUID (v4), remove hyphens and prepend 'v' to indicate vault, and append with EncryptionType to
        // indicate the type of encryption we are using.
        // Only do this though if the vault doesn't have an ID already present.
        if (!vault._id) {
            let vaultId = window.crypto.randomUUID();
            vaultId = vaultId.replace(/-/g, "");
            vaultId = `vault:${vaultId}`;

            encryptedVault._id = vaultId;
        }

        // Generate a symmetric encryption key if we don't have one already, to be used for all items in a vault.
        // We want to encrypt this key with the users master keypair
        const encryptionKey = vault.key || await Crypto.generateSymmetricEncryptionKey();
        const encryptionKeyBuffer = await Crypto.fromBase64(encryptionKey);

        const encryptedVaultKey = await Crypto.encryptAsymmetric(
            await Crypto.fromBase64(encryptionKey),
            await Crypto.fromBase64(privateKey),
            await Crypto.fromBase64(publicKey)
        );
        encryptedVault.key = encryptedVaultKey;

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
       
        // Update or set the modified timestamp as current device UNIX time (milliseconds)
        const currentUnixMilliseconds = Math.floor(Date.now());
        encryptedVault.modified = currentUnixMilliseconds;

        // Set the created time as current UNIX time if not already set
        if (!vault.created) {
            encryptedVault.created = currentUnixMilliseconds;
        }

        return Promise.resolve(encryptedVault);
    }

    /**
     * Returns decrypted vault from object.
     * @param vault 
     * @param privateKey 
     * @param publicKey 
     * @returns {VaultModel}
     */
    async decryptFromVaultObject(vault: VaultModel, privateKey: string, publicKey: string): Promise<VaultModel> {
        const decryptedVault = Object.assign({}, vault);

        // Decrypt the "vault key"
        const privateKeyBuffer = await Crypto.fromBase64(privateKey);
        const publicKeyBuffer = await Crypto.fromBase64(publicKey);
        const vaultKey = await Crypto.decryptAsymmetric(
            vault.key,
            privateKeyBuffer,
            publicKeyBuffer
        );

        decryptedVault.key = await Crypto.toBase64(vaultKey);

        // Name
        const name = await Crypto.decrypt(vault.name, vaultKey);
        decryptedVault.name = await Crypto.toText(name);

        // Description
        if (vault.description) {
            const description = await Crypto.decrypt(vault.description, vaultKey);
            decryptedVault.description = await Crypto.toText(description);
        }

        // Icon
        if (vault.icon) {
            const icon = await Crypto.decrypt(vault.icon, vaultKey);
            decryptedVault.icon = await Crypto.toText(icon);
        }

        return Promise.resolve(decryptedVault);
    }
}

export {
    Vault
}