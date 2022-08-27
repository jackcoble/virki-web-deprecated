export enum OTPType {
    TOTP = "totp",
    HOTP = "hotp",
    Steam = "steam"
}

export enum OTPAlgorithm {
    SHA1 = "sha1",
    SHA256 = "sha256",
    SHA512 = "sha512"
}

export interface Token {
    id: string; // Unique identifier for this token
    vault_id: string; // Vault ID the token belongs to

    issuer: string;
    label: string; // This is the username value
    icon?: string;
    secret: string;
    algorithm: OTPAlgorithm;
    length: number;
    otp_type: OTPType;
    period?: number;
    counter?: number;

    tags: string[]; // IDs of tags

    modified: number;
    created: number;
}