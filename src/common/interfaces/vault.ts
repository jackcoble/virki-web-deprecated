export interface Vault {
    id: string;
    key: string;
    name: string;
    description?: string;
    icon?: string;
    created: number;
    modified: number;