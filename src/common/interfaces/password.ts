export interface StretchedPassword {
    hash: string;
    key: string;
    salt: string;
    opsLimit: number;
    memLimit: number;
}