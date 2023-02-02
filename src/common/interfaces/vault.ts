// Representation of a Vault
export interface Vault {
    id: string;
    order: number;
    encryption_key: string;
    name: string;
    icon?: string;
    created: number | null;
    modified: number | null;

    // Properties which are local to the client
    icon_blob?: string;
}