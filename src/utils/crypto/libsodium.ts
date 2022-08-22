import sodium from "libsodium-wrappers";
import type { KEK } from "@/types/user"

// We expect encrypt/decrypt actions to return the following.
interface RawCryptoResult {
    key: Uint8Array;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    mac: Uint8Array;
}

interface Base64CryptoResult {
    key: string;
    ciphertext: string;
    nonce: string;
    mac: string;
}

/**
 * Encrypts data with a symmetric key.
 * @param data 
 * @param key 
 * @returns 
 */
export async function encrypt(data: Uint8Array, key?: Uint8Array): Promise<RawCryptoResult> {
    await sodium.ready;

    const uintKey: Uint8Array = key || sodium.crypto_secretbox_keygen();
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    const box = sodium.crypto_secretbox_detached(data, nonce, uintKey);

    return {
        key: uintKey,
        ciphertext: box.cipher,
        nonce: nonce,
        mac: box.mac
    }
}

/**
 * Encrypts data and returns an object with Base64 Encoded values
 * @param data 
 * @param key 
 * @returns 
 */
export async function encryptToB64(data: string, key?: string): Promise<Base64CryptoResult> {
    await sodium.ready;

    const uintKey: Uint8Array = key ? await fromBase64(key) : new Uint8Array();
    const encrypted = await encrypt(
        await fromBase64(data),
        uintKey 
    )
    
    // Return Base64 encoded object
    return {
        key: await toBase64(encrypted.key),
        ciphertext: await toBase64(encrypted.ciphertext),
        nonce: await toBase64(encrypted.nonce),
        mac: await toBase64(encrypted.mac)
    }
}

/**
 * Encrypt data from UTF-8 format.
 * @param data - UTF-8 encoded data
 * @param key - Base64 encoded encryption key
 */
export async function encryptUTF8(data: string, key?: string): Promise<Base64CryptoResult> {
    const b64Data = await toBase64(await fromString(data));
    return await encryptToB64(b64Data, key);
}

/**
 * Decrypts data with a supplied symmetric key
 * @param ciphertext 
 * @param nonce 
 * @param mac 
 * @param key 
 */
export async function decrypt(ciphertext: Uint8Array, mac: Uint8Array, nonce: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
    await sodium.ready;

    const decrypted = sodium.crypto_secretbox_open_detached(
        ciphertext,
        mac,
        nonce,
        key
    )

    return decrypted;
}

export async function decryptFromB64(ciphertext: string, mac: string, nonce: string, key: string): Promise<string> {
    await sodium.ready;

    const decryptedRaw = await decrypt(
        await fromBase64(ciphertext),
        await fromBase64(mac),
        await fromBase64(nonce),
        await fromBase64(key)
    );

    const decrypted = await toBase64(decryptedRaw);
    return decrypted;
}

/**
 * Derive stretched encryption key
 * @param passphrase - User supplied password
 * @param salt - Base64 encoded salt value
 * @param opsLimit - Argon2 maximum CPU computations to perform 
 * @param memLimit - Argon2 maximum RAM hashing function will use.
 */
export async function deriveKeyEncryptionKey(passphrase: string, salt?: string, opsLimit?: number, memLimit?: number): Promise<KEK | null> {
    await sodium.ready;

    // Default algorithm can change in future, so added this in as a safeguard.
    if (sodium.crypto_pwhash_ALG_DEFAULT !== sodium.crypto_pwhash_ALG_ARGON2ID13) {
        return Promise.reject("Mismatch with expected password hashing algorithm!");
    }

    // Generate salt if not provided as parameter
    const saltBuffer = salt ? await fromBase64(salt) : sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

    // Determine opsLimit and memLimit
    opsLimit = opsLimit ? opsLimit : sodium.crypto_pwhash_OPSLIMIT_SENSITIVE;
    memLimit = memLimit ? memLimit : sodium.crypto_pwhash_MEMLIMIT_SENSITIVE;

    // If any operation fails due to insufficient memory, double the computation allowed and halve the memory limit.
    const minMemLimit = sodium.crypto_pwhash_MEMLIMIT_MIN;
    while (memLimit > minMemLimit) {
        try {
            const key = sodium.crypto_pwhash(sodium.crypto_secretbox_KEYBYTES, passphrase, saltBuffer, opsLimit, memLimit, sodium.crypto_pwhash_ALG_DEFAULT);
            const kek: KEK = {
                key: await toBase64(key),
                salt: await toBase64(saltBuffer),
                opsLimit: opsLimit,
                memLimit: memLimit
            }
            
            return Promise.resolve(kek);
        } catch (e) {
            opsLimit *= 2;
            memLimit /= 2;
        }
    }

    return Promise.resolve(null);
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

export async function generateKeypair(): Promise<any> {
    await sodium.ready;
    const keypair = sodium.crypto_box_keypair();

    return {
        publicKey: await toBase64(keypair.publicKey),
        privateKey: await toBase64(keypair.privateKey)
    }
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