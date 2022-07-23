import { createMessage, decrypt, encrypt, readMessage, type Config } from "openpgp";
import { AuthoriserDB } from "@/class/db";
import * as sodium from "libsodium-wrappers";

const MASTER_KEY_BITS_LENGTH = 1024;
const OPENPGP_CONFIG = {
    showComment: true,
    showVersion: true
} as Config;

enum EncryptionType {
    OPENPGP = 1,
    XCHACHA20POLY1305
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
        await sodium.ready;

        // Default algorithm can change in future, so added this in as a safeguard.
        if (sodium.crypto_pwhash_ALG_DEFAULT !== sodium.crypto_pwhash_ALG_ARGON2ID13) {
            return Promise.reject("Mismatch with expected password hashing algorithm!");
        }

        // Generate salt if not provided as parameter
        let saltBuffer = new Uint8Array(16);
        if (!salt) {
            saltBuffer = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
        } else {
            // Otherwise convert provided Salt string into Buffer format
            saltBuffer = sodium.from_base64(salt, sodium.base64_variants.ORIGINAL);
        }

        // Derive stretched key using Sodium and Argon2ID
        const key = sodium.crypto_pwhash(sodium.crypto_secretbox_KEYBYTES, password, saltBuffer, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodium.crypto_pwhash_ALG_DEFAULT, "base64");
        const keyPayload = {
            key: key,
            salt: sodium.to_base64(saltBuffer, sodium.base64_variants.ORIGINAL)
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
     * Generates an X25519 keypair used for asymmetric cryptographic operations
     * @returns {sodium.StringKeyPair}
     */
    async generateKeyPair(): Promise<sodium.StringKeyPair> {
        await sodium.ready;

        const keypair = sodium.crypto_box_keypair("base64");
        return Promise.resolve(keypair);
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
     * Encrypts the master symmetric key with the users stretched password. Returned payload should contain the encrypted master key
     * @param stretchedKey - Base64 encoded version of the stretched password.
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

    async generateEd25519Keypair(): Promise<any> {
        await sodium.ready;

        // Encrypt using XChaCha20-Poly1305 with a symmetric key
        const key = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
        const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_IETF_NPUBBYTES);
        console.log("Key:", sodium.to_base64(key));
        console.log("Nonce:", sodium.to_base64(nonce));

        const d = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt_detached("hello world!", null, null, nonce, key, "base64");

        // Generate an cipher string.
        // Format encryptionType|ciphertext|nonce|mac
        const cipherString = `${EncryptionType.XCHACHA20POLY1305}.${d.ciphertext}|${sodium.to_base64(nonce)}|${d.mac}`;
        console.log("Cipher string:", cipherString);

        // Parse the cipher string
        const splitCipherString = cipherString.split(".");

        // Decrypt depending on encryptiontype
        switch (parseInt(splitCipherString[0])) {
            case 2:
                // XChaCha20-Poly1305
                // Split up the encryption data
                const encryptionData = splitCipherString[1].split("|");
                const ciphertext = sodium.from_base64(encryptionData[0]);
                const nonce = sodium.from_base64(encryptionData[1]);
                const mac = sodium.from_base64(encryptionData[2]);

                // Decrypt the message
                const message = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt_detached(null, ciphertext, mac, null, nonce, key, "text");
                console.log(message);

                break;
        
            default:
                break;
        }
    }
}

export { EncryptionType }