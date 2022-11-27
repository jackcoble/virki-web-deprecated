import type { EncryptionType } from "../enums/encryptionType";

// Interface representing the parsed format of a "cipher"
export interface Cipher {
    type: EncryptionType;
    ciphertext: string;
    nonce: string;
    mac: string;
}