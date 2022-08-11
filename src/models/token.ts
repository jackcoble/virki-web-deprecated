import type { OTPAlgorithm, OTPType } from "@/class/token";

type Token = {
    _id: string;
    _rev?: string;
    type: string;
    vault: string; // Vault ID the token belongs to

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

    modified:  number;
    created: number;
}

export type {
    Token
}