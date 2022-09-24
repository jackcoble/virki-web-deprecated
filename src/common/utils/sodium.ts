import sodium from "libsodium-wrappers";
import type { EncryptionResult, RawEncryptionResult } from "../interfaces/encryption";

export class Sodium {
    /*
    ========================
    Text Encoding utilities
    ========================
    */

    /**
     * Converts Uint8Array to Base64 string.
     * @param input 
     * @returns {string}
     */
    static async toBase64(input: Uint8Array): Promise<string> {
        await sodium.ready;
        return sodium.to_base64(input, sodium.base64_variants.ORIGINAL);
    }

    /**
     * Converts Base64 encoded string into Uint8Array.
     * @param input 
     * @returns {Uint8Array}
     */
    static async fromBase64(input: string): Promise<Uint8Array> {
        await sodium.ready;
        return sodium.from_base64(input, sodium.base64_variants.ORIGINAL);
    }

    /**
     * Converts string input into Uint8Array
     * @param input 
     * @returns {Uint8Array}
     */
    static async fromString(input: string): Promise<Uint8Array> {
        await sodium.ready;
        return sodium.from_string(input);
    }

    /**
     * Converts Base64 encoded string into a hexadecimal string.
     * @param input 
     * @returns {string}
     */
    static async toHex(input: string): Promise<string> {
        await sodium.ready;
        return sodium.to_hex(await this.fromBase64(input));
    }

    /**
     * Converts Hexadecimal string to Base64 encoded string
     * @param input 
     * @returns {string}
     */
    static async fromHex(input: string): Promise<string> {
        await sodium.ready;
        return await this.toBase64(sodium.from_hex(input));
    }

    /**
     * Converts Uint8Array to a text string.
     * @param input 
     * @returns {string}
     */
    static async toText(input: Uint8Array): Promise<string> {
        await sodium.ready;
        return sodium.to_string(input);
    }

    /*
    ========================
    Key/Encryption utilities
    ========================
    */

    /**
     * Generates salt to be used for password hashing or encryption.
     * @returns {string}
     */
    static async generateSalt(): Promise<string> {
        await sodium.ready;
        return await this.toBase64(sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES));
    }

    /**
     * Generates a random key used for symmetric encryption.
     * @returns {string}
     */
    static async generateEncryptionKey(): Promise<string> {
        await sodium.ready;
        return await this.toBase64(sodium.crypto_kdf_keygen())
    }

    /**
     * Generates an X25519 keypair and returns as Base64 encoded object.
     * @returns {sodium.StringKeyPair}
     */
    static async generateKeypair(): Promise<sodium.StringKeyPair> {
        await sodium.ready;
        const keypair = sodium.crypto_box_keypair("base64");

        return Promise.resolve(keypair);
    }

    /**
     * Return a SHA-256 hash of provided data.
     * @param input - Data to be hashed
     * @returns {string}
     */
    static async sha256hash(input: Uint8Array): Promise<string> {
        const hash = await window.crypto.subtle.digest("SHA-256", input);
        const hashBuffer = Buffer.from(hash);

        return await this.toBase64(hashBuffer);
    }

    /**
     * Encrypts data with XChaCha20-Poly1305 with a symmetric key.
     * @param data 
     * @param key 
     * @returns {RawEncryptionResult}
     */
    static async encrypt(data: Uint8Array, key?: Uint8Array): Promise<RawEncryptionResult> {
        await sodium.ready;

        const uintKey: Uint8Array = key || sodium.crypto_secretbox_keygen();
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const box = sodium.crypto_secretbox_detached(data, nonce, uintKey);

        return Promise.resolve({
            key: uintKey,
            ciphertext: box.cipher,
            nonce: nonce,
            mac: box.mac
        })
    }

    /**
     * Encrypts data with XChaCha20-Poly1305 with a symmetric key (all provided as Base64 encoded strings).
     * @param data 
     * @param key 
     * @returns {EncryptionResult}
     */
    static async encryptToB64(data: string, key?: string): Promise<EncryptionResult> {
        await sodium.ready;

        const uintKey: Uint8Array = key ? await this.fromBase64(key) : sodium.crypto_secretbox_keygen();
        const encrypted = await this.encrypt(
            await this.fromBase64(data),
            uintKey
        )

        // Return Base64 encoded EncryptionResult
        return {
            key: await this.toBase64(encrypted.key),
            ciphertext: await this.toBase64(encrypted.ciphertext),
            nonce: await this.toBase64(encrypted.nonce),
            mac: await this.toBase64(encrypted.mac)
        }
    }

    /**
     * Encrypts UTF-8 formatted strings with XChaCha20-Poly1305, returning an output that is Base64 encoded.
     * @param data 
     * @param key 
     * @returns {EncryptionResult}
     */
    static async encryptUTF8(data: string, key?: string): Promise<EncryptionResult> {
        const rawData = await this.fromString(data);
        const base64 = await this.toBase64(rawData);

        return await this.encryptToB64(base64);
    }
}