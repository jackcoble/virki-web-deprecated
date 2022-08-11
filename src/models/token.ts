import type { OTPAlgorithm, OTPType } from "@/class/token";

type Token = {
    _id: string;
    _rev?: string;
    _type: string;

    issuer: string;
    label: string; // This is the username value
    icon?: string;
    secret: string;
    algorithm: OTPAlgorithm;
    length: number;
    type: OTPType;
    period?: number;
    counter?: number;

    modified:  number;
    created: number;
}

export type {
    Token
}