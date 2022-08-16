// Key encryption key (KEK)
export interface KEK {
    key: string;
    salt: string;
    opsLimit: number;
    memLimit: number;
}