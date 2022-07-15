// EncryptedVault is what we are expected in the OpenPGP message after decryption
interface EncryptedVault {
    id?: string;
    name: string;
    description: string;
    icon?: string;
}

export type {
    EncryptedVault
}