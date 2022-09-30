import sodium from "libsodium-wrappers";
import type { EncryptionResult, RawEncryptionResult } from "../interfaces/encryption";

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
export async function toBase64(input: Uint8Array): Promise<string> {
    await sodium.ready;
    return sodium.to_base64(input, sodium.base64_variants.ORIGINAL);
}

/**
 * Converts Base64 encoded string into Uint8Array.
 * @param input 
 * @returns {Uint8Array}
 */
export async function fromBase64(input: string): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.from_base64(input, sodium.base64_variants.ORIGINAL);
}

/**
 * Converts string input into Uint8Array
 * @param input 
 * @returns {Uint8Array}
 */
export async function fromString(input: string): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.from_string(input);
}

/**
 * Converts Base64 encoded string into a hexadecimal string.
 * @param input 
 * @returns {string}
 */
export async function toHex(input: string): Promise<string> {
    await sodium.ready;
    return sodium.to_hex(await fromBase64(input));
}

/**
 * Converts Hexadecimal string to Base64 encoded string
 * @param input 
 * @returns {string}
 */
export async function fromHex(input: string): Promise<string> {
    await sodium.ready;
    return await toBase64(sodium.from_hex(input));
}

/**
 * Converts Uint8Array to a text string.
 * @param input 
 * @returns {string}
 */
export async function toText(input: Uint8Array): Promise<string> {
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
export async function generateSalt(): Promise<string> {
    await sodium.ready;
    return await toBase64(sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES));
}

/**
 * Generates a random key used for symmetric encryption.
 * @returns {string}
 */
export async function generateEncryptionKey(): Promise<string> {
    await sodium.ready;
    return await toBase64(sodium.crypto_kdf_keygen())
}

/**
 * Generates an X25519 keypair and returns as Base64 encoded object.
 * @returns {sodium.StringKeyPair}
 */
export async function generateKeypair(): Promise<sodium.StringKeyPair> {
    await sodium.ready;
    const keypair = sodium.crypto_box_keypair();

    const stringKeypair = {
        publicKey: await toBase64(keypair.publicKey),
        privateKey: await toBase64(keypair.privateKey)
    } as sodium.StringKeyPair;

    return Promise.resolve(stringKeypair);
}

/**
 * Return a SHA-512 hash of provided data.
 * @param input - Data to be hashed
 * @returns {string}
 */
export async function sha512hash(input: Uint8Array): Promise<string> {
    const hash = await self.crypto.subtle.digest("SHA-512", input);
    const hashBuffer = new Uint8Array(hash)

    return await toBase64(hashBuffer);
}

/**
 * Encrypts data with XChaCha20-Poly1305 with a symmetric key.
 * @param data 
 * @param key 
 * @returns {RawEncryptionResult}
 */
export async function encrypt(data: Uint8Array, key?: Uint8Array): Promise<RawEncryptionResult> {
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
export async function encryptToB64(data: string, key?: string): Promise<EncryptionResult> {
    await sodium.ready;

    const uintKey: Uint8Array = key ? await fromBase64(key) : sodium.crypto_secretbox_keygen();
    const encrypted = await encrypt(
        await fromBase64(data),
        uintKey
    )

    // Return Base64 encoded EncryptionResult
    return {
        key: await toBase64(encrypted.key),
        ciphertext: await toBase64(encrypted.ciphertext),
        nonce: await toBase64(encrypted.nonce),
        mac: await toBase64(encrypted.mac)
    }
}

/**
 * Encrypts UTF-8 formatted strings with XChaCha20-Poly1305, returning an output that is Base64 encoded.
 * @param data 
 * @param key 
 * @returns {EncryptionResult}
 */
export async function encryptUTF8(data: string, key?: string): Promise<EncryptionResult> {
    const rawData = await fromString(data);
    const base64 = await toBase64(rawData);

    return await encryptToB64(base64);
}