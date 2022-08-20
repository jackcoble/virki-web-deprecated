export interface Keys {
    // KEK is derived from user password and remains client-side.
    kek: {
        salt: string;
        ops_limit: number;
        mem_limit: number;
    }

    // The master key is used for symmetric cryptography operations
    // and is encrypted with the KEK.
    master_encryption_key: string;

    // X25519 keypair used for asymmetric cryptography operations
    // where the privateKey is encrypted using the master key.
    keypair: {
        public_key: string;
        private_key: string;
    }

    // Recovery key is used in the event the user has forgotten their password.
    // Should be encrypted with the master key for secure storage.
    // And then encrypt the master key with the recovery key.
    recovery: {
        master_key_encrypted_with_recovery_key: string; // Master key has been encrypted with recovery key
        recovery_key_encrypted_with_master_key: string // Recovery key encrypted with master key
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
    encrypted_keys: Keys;
    encrypted_session: string;
    session: string;
}