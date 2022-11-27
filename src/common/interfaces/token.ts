import type { OTPAlgorithm, OTPType } from "../enums/otp";

export interface Token {
    id: string; // Unique identifier for this token
    vault_id: string; // Vault ID the token belongs to

    key: string; // Random key used for encryption

    service: string;
    account: string; // This is the username value
    icon?: string;
    secret: string;
    algorithm: OTPAlgorithm;
    length: number;
    type: OTPType;
    period?: number;
    counter?: number;

    //tags: string[]; // IDs of tags

    modified: number;
    created: number;
}