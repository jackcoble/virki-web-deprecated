export interface Keys {
    // KEK is derived from user password and remains client-side.
    kek: {
        salt: string;
        opsLimit: number;
        memLimit: number;
    }

    // The master key is used for symmetric cryptography operations
    // and is encrypted with the KEK.
    masterEncryptionKey: string;

    // X25519 keypair used for asymmetric cryptography operations
    // where the privateKey is encrypted using the master key.
    keypair: {
        publicKey: string;
        privateKey: string;
    }

    // Recovery key is used in the event the user has forgotten their password.
    // Should be encrypted with the master key for secure storage.
    // And then encrypt the master key with the recovery key.
    recovery: {
        masterKeyEncryptedWithRecoveryKey: string; // Master key has been encrypted with recovery key
        recoveryKeyEncryptedWithMasterKey: string // Recovery key encrypted with master key
    }
}

// Key encryption key (KEK)
export interface KEK {
    key: string;
    salt: string;
    opsLimit: number;
    memLimit: number;
}

// TwoFactorAuthentication response
export interface TwoFactorResponse {
    id: string;
    email: string;
    encryptedKeys: Keys;
    encryptedSession: string;
    session: string;
}