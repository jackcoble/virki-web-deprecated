import sodium from "libsodium-wrappers";
import type { KEK } from "@/types/user"

/**
 * Encrypts data with a symmetric key.
 * @param data 
 * @param key 
 * @returns 
 */
export async function encrypt(data: Uint8Array, key?: Uint8Array | null): Promise<any> {
    await sodium.ready;

    const uintKey: Uint8Array = key || sodium.crypto_secretbox_keygen();
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = sodium.crypto_secretbox_easy(data, nonce, uintKey);

    return {
        key: key,
        ciphertext: ciphertext,
        nonce: nonce
    }
}

export async function encryptToB64(data: string, key?: string): Promise<any> {
    await sodium.ready;
    const encrypted = await encrypt(
        await fromBase64(data),
        key ? await fromBase64(key) : null
    )
    
    // Return Base64 encoded object
    return {
        key: await toBase64(encrypted.key),
        ciphertext: await toBase64(encrypted.ciphertext),
        nonce: await toBase64(encrypted.nonce)
    }
}

/**
 * Derive stretched encryption key
 * @param passphrase - User supplied password
 * @param salt - Base64 encoded salt value
 * @param opsLimit - Argon2 maximum CPU computations to perform 
 * @param memLimit - Argon2 maximum RAM hashing function will use.
 */
export async function deriveKeyEncryptionKey(passphrase: string, salt?: string, opsLimit?: number, memLimit?: number): Promise<KEK> {
    await sodium.ready;

    // Default algorithm can change in future, so added this in as a safeguard.
    if (sodium.crypto_pwhash_ALG_DEFAULT !== sodium.crypto_pwhash_ALG_ARGON2ID13) {
        return Promise.reject("Mismatch with expected password hashing algorithm!");
    }

    // Generate salt if not provided as parameter
    const saltBuffer = salt ? await fromBase64(salt) : sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

    // Determine opsLimit and memLimit
    // Ideally we would use SENSITIVE here, but use INTERACTIVE until we can figure out WebWorkers...
    opsLimit = opsLimit ? opsLimit : sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE;
    memLimit = memLimit ? memLimit : sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE;

    // Derive stretched key using Sodium and Argon2ID
    const key = sodium.crypto_pwhash(sodium.crypto_secretbox_KEYBYTES, passphrase, saltBuffer, opsLimit, memLimit, sodium.crypto_pwhash_ALG_DEFAULT);

    const kek: KEK = {
        key: await toBase64(key),
        salt: await toBase64(saltBuffer),
        opsLimit: opsLimit,
        memLimit: memLimit
    }
    
    return Promise.resolve(kek);
}

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
 * Return a SHA-256 hash of provided data.
 * @param input - Data to be hashed
 * @returns {string}
 */
export async function sha256hash(input: Uint8Array): Promise<string> {
    const hash = await window.crypto.subtle.digest("SHA-256", input);
    const hashBuffer = Buffer.from(hash);

    return await toBase64(hashBuffer);
}

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