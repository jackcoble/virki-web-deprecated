import * as sodium from "libsodium-wrappers";
import { Crypto } from "./crypto";

interface IAccount {
    email: string;
    name: string;
    password: {
        hash: string;
        salt: string;
        hint?: string;
    }
    encrypted_master_keypair: {
        private_key: string;
        public_key: string;
    }
}

export class Account {
    private masterKeyPair: any;
    
    constructor(masterPrivateKey: string, masterPublicKey: string) {
        this.masterKeyPair = {
            privateKey: masterPrivateKey,
            publicKey: masterPublicKey
        }
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
        let saltBuffer = salt ? await Crypto.fromBase64(salt) : sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

        // Derive stretched key using Sodium and Argon2ID
        const key = sodium.crypto_pwhash(sodium.crypto_secretbox_KEYBYTES, password, saltBuffer, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodium.crypto_pwhash_ALG_DEFAULT);
        const keyPayload = {
            key: await Crypto.toBase64(key),
            salt: await Crypto.toBase64(saltBuffer)
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
}

export type {
    IAccount
}