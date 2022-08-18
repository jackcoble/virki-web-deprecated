// Enum representing the different encryption types available to us
export enum EncryptionType {
    XCHACHA20_POLY1305 = "xchach20poly1305"
}

// Interface representing the parsed format of a "cipher"
export interface Cipher {
    type: EncryptionType;
    ciphertext: string;
    nonce: string;
    mac?: string;
}