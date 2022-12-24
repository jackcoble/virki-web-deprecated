import sodium from "libsodium-wrappers";
import { EncryptionType } from "../enums/encryptionType";
import type { EncryptionResult, RawEncryptionResult } from "../interfaces/encryption";
import type { EncryptedFile } from "../interfaces/file";
import { parseCipherString, serialiseCipherString } from "./cipher";

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

    return await encryptToB64(base64, key);
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

/**
 * Decrypts Base64 encoded data
 * @param ciphertext 
 * @param mac 
 * @param nonce 
 * @param key 
 * @returns 
 */
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
 * Decrypts Base64 encoded data into UTF8
 * @param data 
 * @param mac 
 * @param nonce 
 * @param key 
 * @returns 
 */
export async function decryptToUTF8(data: string, mac: string, nonce: string, key: string): Promise<string> {
    await sodium.ready;

    const decrypted = await decrypt(
        await fromBase64(data),
        await fromBase64(mac),
        await fromBase64(nonce),
        await fromBase64(key)
    )

    const decryptedUTF8 = sodium.to_string(decrypted);
    return Promise.resolve(decryptedUTF8);
}

/**
 * Decrypt from a cipher string
 * @param cipherString - A cipherstring containing Base64 data we want decrypted
 * @param key - Encryption key used for the data
 * @returns 
 */
export async function decryptFromB64CipherString(cipherString: string, key: string) {
    // Parse the cipher string and decrypt the data
    try {
        const cipher = await parseCipherString(cipherString);
        const decrypted = await decryptFromB64(
            cipher.ciphertext,
            cipher.mac,
            cipher.nonce,
            key
        );

        return Promise.resolve(decrypted);
    } catch (e) {
        return Promise.reject(e);
    }
}

/**
 * Decrypt and return UTF-8 data from a Cipherstring
 * @param cipherString - Cipherstring containing UTF8 data to be returned once decrypted
 * @param key - Encryption key used for the data
 * @returns 
 */
export async function decryptFromB64CipherStringToUTF8(cipherString: string, key: string) {
    // Parse the cipher string and decrypt the data
    try {
        const cipher = await parseCipherString(cipherString);
        const decrypted = await decryptToUTF8(
            cipher.ciphertext,
            cipher.mac,
            cipher.nonce,
            key
        );

        return Promise.resolve(decrypted);
    } catch (e) {
        return Promise.reject(e);
    }
}

/*
====================================
File Encryption/Decryption utilities
====================================
*/

/**
 * Encrypts a file and returns the encrypted file data.
 * @param fileName 
 * @param fileType 
 * @param fileContent 
 * @param object_key 
 * @param encryption_key 
 * @returns {EncryptedFile}
 */
export async function encryptFile(fileName: string, fileType: string, fileContent: Uint8Array, object_key: string, encryption_key?: string): Promise<EncryptedFile> {
    // If there is no key provided, generate one...
    if (!encryption_key) {
        encryption_key = await generateEncryptionKey();
    }

    // Convert key to bytes for use with encryption
    const keyBytes = await fromBase64(encryption_key);

    // Encrypt the file name and file type (used for client-side reconstruction of the file)
    // and their subsequent cipher strings
    const fileNameEncrypted = await encryptUTF8(fileName, encryption_key);
    const fileTypeEncrypted = await encryptUTF8(fileType, encryption_key);

    const fileNameEncryptedCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, fileNameEncrypted.ciphertext, fileNameEncrypted.nonce, fileNameEncrypted.mac);
    const fileTypeEncryptedCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, fileTypeEncrypted.ciphertext, fileTypeEncrypted.nonce, fileTypeEncrypted.mac);

    // File encryption
    // Create a new state and encrypt the contents
    // Also encrypt the data state header
    const state = sodium.crypto_secretstream_xchacha20poly1305_init_push(keyBytes);
    const encryptedFile = sodium.crypto_secretstream_xchacha20poly1305_push(
        state.state,
        fileContent,
        null,
        sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
    );
    const file = new Blob([encryptedFile], { type: "application/octet-stream" });

    const stateHeaderB64 = await toBase64(state.header);
    const encryptedStateHeader = await encryptToB64(stateHeaderB64, encryption_key);
    const encryptedStateHeaderCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedStateHeader.ciphertext, encryptedStateHeader.nonce, encryptedStateHeader.mac);

    // Construct an encrypted file object containg all the data we need and can upload straight to the API
    const fileObject: EncryptedFile = {
        file_name: fileNameEncryptedCipherString,
        file_encryption_header: encryptedStateHeaderCipherString,
        mime_type: fileTypeEncryptedCipherString,
        content: file,
        encryption_key: encryption_key,
        object_key: object_key
    }

    return Promise.resolve(fileObject);
}

export async function decryptFile(content: Uint8Array, mime_type: string, encryption_header: string, encryption_key: string): Promise<Blob> {
    // Convert the encryption key into bytes
    const encryptionKeyBytes = await fromBase64(encryption_key);

    // Need to convert the encryption header back into Bytes
    // and reconstruct the header
    const encryptionHeaderBytes = await fromBase64(encryption_header);
    const dataState = sodium.crypto_secretstream_xchacha20poly1305_init_pull(encryptionHeaderBytes, encryptionKeyBytes);

    // Decrypt the file contents and put them into a Blob
    const decryptedFile = sodium.crypto_secretstream_xchacha20poly1305_pull(dataState, content, null);
    const decryptedFileBlob = new Blob([decryptedFile.message], {
        type: mime_type
    });

    return Promise.resolve(decryptedFileBlob)
}