import * as sodium from "libsodium-wrappers";
import { Cipher, EncryptionType } from "./cipher";

// Structure of an X25519 keypair
interface KeyPair {
    publicKey: string;
    privateKey: string;
}

export class Crypto {
    /**
     * Generates a random X25519 keypair encoded in Base64 format.
     * @returns {KeyPair}
     */
    static async generateKeyPair(): Promise<KeyPair> {
        await sodium.ready;
        const keyPair = sodium.crypto_box_keypair();

        return {
            publicKey: await this.toBase64(keyPair.publicKey),
            privateKey: await this.toBase64(keyPair.privateKey)
        }
    }

    /**
     * Generates a random key used for symmetric encryption.
     * @returns {string}
     */
    static async generateSymmetricEncryptionKey(): Promise<string> {
        await sodium.ready;
        return await this.toBase64(sodium.crypto_kdf_keygen())
    }

    /**
     * Encrypts data using a symmetric key and returns a "cipher" string.
     * @param data - Uint8Array format data to be encrypted.
     * @param key - Encryption key to be used.
     * @returns {string} - "Cipher" string.
     */
    static async encrypt(data: Uint8Array, key: Uint8Array): Promise<string> {
        await sodium.ready;

        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const box = sodium.crypto_secretbox_detached(data, nonce, key);

        // Serialise the data into a cipherstring
        const cipherString = Cipher.serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, await this.toBase64(box.cipher), await this.toBase64(nonce), await this.toBase64(box.mac));
        return Promise.resolve(cipherString);
    }

    /**
     * Decrypts and returns data when provided with a cipher string and decryption key.
     * @param cipherString - "Cipher" string containing necessary data for a successful decryption.
     * @param key - Symmetric key used for encryption.
     * @returns{string} - Decrypted data.
     */
    static async decrypt(cipherString: string, key: Uint8Array): Promise<string> {
        await sodium.ready;

        // Parse the "cipher" string and decrypt it
        const cipher = await Cipher.parseCipherString(cipherString);
        if (!cipher.mac) {
            return Promise.reject("Cipher string does not have authentication tag!");
        }
        
        const decryptedData = sodium.crypto_secretbox_open_detached(
            await this.fromBase64(cipher.ciphertext),
            await this.fromBase64(cipher.mac),
            await this.fromBase64(cipher.nonce),
            key
        );

        return Promise.resolve(await this.toBase64(decryptedData));
    }

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
     * Converts hexadecimal string into a Base64 encoded string.
     * @param input 
     * @returns {string}
     */
    static async fromHex(input: string): Promise<string> {
        await sodium.ready;
        return await this.toBase64(sodium.from_hex(input));
    }
}