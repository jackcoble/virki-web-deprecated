export interface EncryptionResult {
    key: string;
    ciphertext: string;
    nonce: string;
    mac: string;
}

export interface RawEncryptionResult {
    key: Uint8Array;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    mac: Uint8Array;
}