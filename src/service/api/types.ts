// These types match the DTOs which are on the backend.
// They should be used for network requests to ensure consistent
// modelling of data.

export interface AccountRegistrationRequestBody {
    email: string;
    name: string;
    keys: {
        masterEncryptionKey: string;
        kek: {
            hash: string;
            salt: string;
            memLimit: number;
            opsLimit: number;
        }
        sharing: {
            publicKey: string;
            privateKey: string;
        }
        recovery: {
            masterKeyEncryptedWithRecoveryKey: string;
            recoveryKeyEncryptedWithMasterKey: string;
        }
    }
}

export interface AccountRegistrationResponseBody {
    session: string;
}

export interface GetKeysResponse {
    masterEncryptionKey: string;
    kek: {
        salt: string;
        memLimit: number;
        opsLimit: number;
    }
    sharing: {
        publicKey: string;
        privateKey: string;
    }
    recovery: {
        masterKeyEncryptedWithRecoveryKey: string;
        recoveryKeyEncryptedWithMasterKey: string;
    }
}

export interface VaultCreationRequestBody {
    encryptionKey: string;
    name: string;
    description?: string;
    icon?: string;
}

export interface VaultCreationResponseBody {
    id: string;
    encryptionKey: string;
    name: string;
    description?: string;
    icon?: string;
    created: string;
}

export interface GetVaultsResponseBody {
    id: string;
    encryptionKey: string;
    name: string;
    description?: string;
    icon?: string;
    created: string;
}

export interface FilePresignedURLResponseBody {
    key: string;
    url: string;
}