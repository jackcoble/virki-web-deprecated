// Representation of a Vault
export interface Vault {
    id: string;
    encryption_key: string;
    name: string;
    icon?: string;
    createdAt: string;
    updatedAt: string;
}