import { EncryptionType } from "@/common/enums/encryptionType";
import type { Cipher } from "@/common/interfaces/cipher";

/**
 * Parses a "cipher" string into a usable object.
 * @param cipherString 
 * @returns {object}
 */
export function parseCipherString(cipherString: string): Promise<Cipher> {
    /*
        A "cipher" string typically follows this format
        EncryptionType.CipherText|Nonce|MAC

        We want to parse a "cipher" string and return the contents
        of it in an object.
    */

    // Split the "cipher" string by the period character, so we can validate the EncryptionType.
    const encryptionType = parseInt(cipherString.split(".")[0]);
    if (!Object.values(EncryptionType).includes(encryptionType)) {
        return Promise.reject("Encryption type is invalid!");
    }

    // Depending on the EncryptionType, a "cipher" string may be formatted differently,
    // possibly due to additional options being required for that encryption algorithm.
    // So depending on the algorithm, we can parse it accordingly.
    const cipherSplit = cipherString.split(".")[1].split("|");
    const cipher = {} as Cipher;

    if (encryptionType === EncryptionType.XCHACHA20_POLY1305) {
        cipher.type = EncryptionType.XCHACHA20_POLY1305;
        cipher.ciphertext = cipherSplit[0];
        cipher.nonce = cipherSplit[1];
        cipher.mac = cipherSplit[2];
    }

    return Promise.resolve(cipher);
}

/**
 * Serialise a "cipher" string to represent encrypted data.
 * @param encryptionType
 * @param cipherText 
 * @param nonce 
 * @param mac 
 * @returns {string}
 */
export function serialiseCipherString(encryptionType: EncryptionType, cipherText: string, nonce: string, mac: string): Promise<string> {
    // Validate the encryptionType against the enum.
    if (!Object.values(EncryptionType).includes(encryptionType)) {
        return Promise.reject("Encryption type is invalid!");
    }

    let cipherString = "";

    switch (encryptionType) {
        case EncryptionType.XCHACHA20_POLY1305:
            // Make sure the parameters are not null or empty
            if (typeof cipherText == undefined || !cipherText) {
                return Promise.reject("Ciphertext cannot be empty!")
            }

            if (typeof nonce == undefined || !nonce) {
                return Promise.reject("Nonce cannot be empty!")
            }

            if (typeof mac == undefined || !mac) {
                return Promise.reject("MAC cannot be empty!")
            }

            // XChaCha20-Poly1305 ciphers must be represented in the following format:
            // 1.CipherText|Nonce|MAC
            cipherString = `${EncryptionType.XCHACHA20_POLY1305}.${cipherText}|${nonce}|${mac}`;
    }

    return Promise.resolve(cipherString);
}