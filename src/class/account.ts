import { hash, ArgonType } from "argon2-browser/dist/argon2-bundled.min.js";
import { createMessage, decrypt, encrypt, enums, readMessage } from "openpgp";

const MASTER_KEY_BITS_LENGTH = 1024;

export class Account {
    private masterKey: Uint8Array;

    constructor(masterKey?: Uint8Array) {
        if (masterKey) {
            this.masterKey = masterKey;
        }
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
            key: stretchedKey.hashHex,
            salt: Buffer.from(salt).toString("hex")
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
            format: "armored"
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
            const saltBuffer = Buffer.from(salt, "hex");
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
}