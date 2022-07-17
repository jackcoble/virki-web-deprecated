import { hash, ArgonType } from "argon2-browser/dist/argon2-bundled.min.js";
import { createMessage, decrypt, encrypt, readMessage, type Config } from "openpgp";
import { AuthoriserDB, type IVaultDB } from "@/class/db";

const MASTER_KEY_BITS_LENGTH = 1024;
const OPENPGP_CONFIG = {
    showComment: true,
    showVersion: true
} as Config;

enum EncryptionType {
    OPENPGP = 1
};

export class Account {
    private masterKey: string;
    private authoriserDB: AuthoriserDB;

    constructor(masterKey?: string) {
        if (masterKey) {
            this.masterKey = masterKey;
        }

        // Initialise DB
        const db = new AuthoriserDB();
        this.authoriserDB = db;
    }

    /**
     * Stretch user password with Argon2
     */
    async deriveStretchedPassword(password: string, salt?: string): Promise<any> {
        let saltBuffer = new Uint8Array(16);

        // Generate salt if not provided as parameter
        if (!salt) {
            saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
        } else {
            // Otherwise convert provided Salt string into Buffer format
            saltBuffer = Buffer.from(salt, "base64");
        }

        const stretchedKey = await hash({
            pass: password,
            salt: saltBuffer,
            type: ArgonType.Argon2id,
            hashLen: 64
        });

        // Convert stretched key from hexadecimal into Base64
        const keyPayload = {
            key: Buffer.from(stretchedKey.hashHex, "hex").toString('base64'),
            salt: Buffer.from(saltBuffer).toString("base64")
        }

        return keyPayload;
    }

    /**
     * Returns a Base64 encoded SHA-256 hash of the users extended password (used for authentication)
     * @param password 
     * @param salt 
     */
    async deriveHashedStretchedPassword(password: string, salt: string): Promise<string> {
        // Extend the users password normally using deriveStretchedPassword
        const stretched = await this.deriveStretchedPassword(password, salt);

        // Derive SHA-256 hash of the Base64 encoded stretched key
        const stretchedKeyBytes = new TextEncoder().encode(stretched.key);
        const stretchedKeyHashBytes = await window.crypto.subtle.digest("SHA-256", stretchedKeyBytes);
        const stretchedKeyHashEncoded = Buffer.from(stretchedKeyHashBytes).toString("base64");

        return stretchedKeyHashEncoded;
    }

    /**
     * Set the master key for an account
     * @param masterKey 
     */
    setMasterKey(masterKey: string) {
        this.masterKey = masterKey;
    }

    /**
     * Generates a "master key" which is used for OpenPGP encryption of string data
     */
    generateMasterKey(): string {
        // 1024-bit master symmetric key 
        const masterKey = window.crypto.getRandomValues(new Uint8Array(MASTER_KEY_BITS_LENGTH));
        const masterKeyString = Buffer.from(masterKey).toString("base64");

        return masterKeyString;
    }

    /**
     * Encrypts the master key with the users stretched password. Returned payload should contain the encrypted master key
     */
    async encryptMasterKey(stretchedKey: string): Promise<string> {
        const message = await createMessage({
            text: this.masterKey
        });

        const encryptedMasterKey = await encrypt({
            message,
            passwords: [stretchedKey],
            format: "armored",
            config: OPENPGP_CONFIG
        });

        return encryptedMasterKey.toString();
    }

    /**
     * Decrypts and returns the master key
     * @param password - user raw password
     * @param salt - salt that was used to stretch the user password
     * @param encryptedMasterKey - OpenPGP armored message
     */
    async decryptMasterKey(password: string, salt: string, encryptedMasterKey: string): Promise<string> {
        try {
            // First derive stretched password.
            const stretchedKey = await this.deriveStretchedPassword(password, salt);

            // Now that we have the stretched key, we can use it to decrypt the PGP message
            const encryptedMessage = await readMessage({
                armoredMessage: encryptedMasterKey,
            });

            const decryptedMasterKey = await decrypt({
                message: encryptedMessage,
                passwords: [stretchedKey.key]
            })

            return Promise.resolve(decryptedMasterKey.data.toString())
        } catch (e) {
            return Promise.reject("Could not decrypt master key, please check your password and try again!");
        }
    }

    /**
     * Decrypt an encrypted master key with the users stretched (Argon2) password
     * @param stretchedKey 
     * @param encryptedMasterKey 
     * @returns {string} - Decrypted master key
     */
    async decryptMasterKeyWithStretchedPassword(stretchedKey: string, encryptedMasterKey: string): Promise<string> {
        try {
            const encryptedMessage = await readMessage({
                armoredMessage: encryptedMasterKey,
            });

            const decryptedMasterKey = await decrypt({
                message: encryptedMessage,
                passwords: [stretchedKey]
            })

            return Promise.resolve(decryptedMasterKey.data.toString())
        } catch (e) {
            return Promise.reject("Could not decrypt master key, please check your password and try again!");
        }
    }

    /**
     * Encrypts string data and returns an OpenPGP message
     * @param data
     * @returns {string}
     */
    async encryptData(data: string): Promise<string> {
        const message = await createMessage({
            text: data
        });

        const encryptedData = await encrypt({
            message,
            passwords: [this.masterKey],
            format: "armored",
            config: OPENPGP_CONFIG
        });

        return encryptedData.toString();
    }

    /**
     * Decrypts an OpenPGP message with the master key
     * @param message 
     */
    async decryptData(message: string): Promise<string> {
        const encryptedMessage = await readMessage({
            armoredMessage: message,
        });

        const decryptedData= await decrypt({
            message: encryptedMessage,
            passwords: [this.masterKey]
        })

        return Promise.resolve(decryptedData.data.toString())
    }

    /**
     * Insert a user to IndexedDB for offline-key storage
     * @param email 
     * @param encryptedMasterKey 
     */
    async insertUserToDB(email: string, encryptedMasterKey: string): Promise<any> {
        await this.authoriserDB.accounts.add({
            account: email,
            encryptedMasterKey: encryptedMasterKey
        });
    }

    /**
     * Insert an encrypted vault payload to IndexedDB so we can use offline.
     * @param vault 
     */
    async addVaultToDB(vault: IVaultDB): Promise<any> {
        await this.authoriserDB.vaults.put({
            id: vault.id,
            uid: vault.uid,
            data: vault.data,
            created: vault.created
        });
    }

    /**
     * Fetches an array of all the vaults we have locally.
     * @returns 
     */
    async getVaultsFromDB(): Promise<IVaultDB[]> {
        const vaults = await this.authoriserDB.vaults.toArray();
        return vaults;
    }
}

export { EncryptionType }