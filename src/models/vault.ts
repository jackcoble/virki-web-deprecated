// EncryptedVault is what we are expected in the OpenPGP message after decryption
interface EncryptedVault {
    name: string;
    description: string;
    icon: string;
}

export type {
    EncryptedVault
}