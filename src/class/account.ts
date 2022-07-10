import { hash, ArgonType } from "argon2-browser/dist/argon2-bundled.min.js";
import { createMessage, decrypt, encrypt, readMessage, type Config } from "openpgp";
import { AuthoriserDB } from "@/class/db";

const MASTER_KEY_BITS_LENGTH = 1024;
const OPENPGP_CONFIG = {
    showComment: true,
    showVersion: true
} as Config;

// Maintain encrypted payload versions for any potential changes
// to encryption algorithms in the future
enum PAYLOAD_VERSION {
    V1 = 1
}

export class Account {
    private masterKey: Uint8Array;
    private authoriserDB: AuthoriserDB;

    constructor(masterKey?: Uint8Array) {
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
    async deriveStretchedPassword(password: string, salt?: Uint8Array): Promise<any> {
        // Generate salt if not provided as parameter
        if (!salt) {
            salt = window.crypto.getRandomValues(new Uint8Array(16));
        }

        const stretchedKey = await hash({
            pass: password,
            salt: salt,
            type: ArgonType.Argon2id,
            hashLen: 64
        });

        const keyPayload = {
            key: Buffer.from(stretchedKey.hashHex, "hex").toString('base64'),
            salt: Buffer.from(salt).toString("base64")
        }

        return keyPayload;
    }

    /**
     * Set the master key for an account
     * @param masterKey 
     */
    setMasterKey(masterKey: Uint8Array) {
        this.masterKey = masterKey;
    }

    /**
     * Generates a "master key" which is used for OpenPGP encryption of string data
     */
    generateMasterKey(): Uint8Array {
        // 1024-bit master symmetric key 
        const masterKey = window.crypto.getRandomValues(new Uint8Array(MASTER_KEY_BITS_LENGTH));
        return masterKey;
    }

    /**
     * Encrypts the master key with the users stretched password. Returned payload should contain the encrypted master key
     */
    async encryptMasterKey(stretchedKey: string): Promise<string> {
        const masterKeyHex = Buffer.from(this.masterKey).toString("hex");
        const message = await createMessage({
            text: masterKeyHex
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
            // Convert salt into buffer format and then derive stretched password.
            const saltBuffer = Buffer.from(salt, "base64");
            const stretchedKey = await this.deriveStretchedPassword(password, saltBuffer);

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
     * Encrypts string data and returns an OpenPGP message
     * @param data
     * @returns {string}
     */
    async encryptData(data: string): Promise<string> {
        const masterKeyEncoded = Buffer.from(this.masterKey).toString("base64");

        const message = await createMessage({
            text: data
        });

        const encryptedData = await encrypt({
            message,
            passwords: [masterKeyEncoded],
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
        const masterKeyEncoded = Buffer.from(this.masterKey).toString("base64");

        const encryptedMessage = await readMessage({
            armoredMessage: message,
        });

        const decryptedData= await decrypt({
            message: encryptedMessage,
            passwords: [masterKeyEncoded]
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
}