type Vault = {
    _id: string;
    _rev?: string;
    name: string;
    description?: string;
    icon?: string;
    key: string;
    modified:  number;
    created: number;
}

export type {
    Vault
}