// Enum representing the different encryption types available to us
enum EncryptionType {
    XCHACHA20_POLY1305 = 1
}

class Cipher {
    /**
     * Parses a "cipher" string into a usable object.
     * @param cipherString 
     * @returns {object}
     */
    static parseCipherString(cipherString: string): Promise<any> {
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

        switch (encryptionType) {
            case EncryptionType.XCHACHA20_POLY1305:
                const cipher = {
                    ciphertext: cipherSplit[0],
                    nonce: cipherSplit[1],
                    mac: cipherSplit[2]
                }

                return Promise.resolve(cipher);
        
            default:
                return Promise.reject("Unexpected error parsing cipher string!")
        }
    }

    /**
     * Serialise a "cipher" string to represent encrypted data.
     * @param encryptionType
     * @param cipherText 
     * @param nonce 
     * @param mac 
     * @returns {string}
     */
    static serialiseCipherString(encryptionType: EncryptionType, cipherText: string, nonce: string, mac: string): Promise<string> {
        // Validate the encryptionType against the enum.
        if (!Object.values(EncryptionType).includes(encryptionType)) {
            return Promise.reject("Encryption type is invalid!");
        }

        switch (encryptionType) {
            case EncryptionType.XCHACHA20_POLY1305:
                // XChaCha20-Poly1305 ciphers must be represented in the following format:
                // 1.CipherText|Nonce|MAC
                const cipherString = `${EncryptionType.XCHACHA20_POLY1305}.${cipherText}|${nonce}|${mac}`;
                return Promise.resolve(cipherString);
        
            default:
                return Promise.reject("Unexpected error serialising cipher string!");
        }
    }
}

export {
    Cipher,
    EncryptionType
}