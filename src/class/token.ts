import { Account } from "./account";

// Enums for Algorithm and Type
enum TokenAlgorithm {
    SHA1 = 0,
    SHA256,
    SHA512
}

enum TokenType {
    TOTP = 0
}

// Interface describing the properties a "Token" entry should have
interface IToken {
    issuer: string;
    account: string;
    secret: string;
    icon?: {
        url: string;
        data: string;
    }
    algorithm: TokenAlgorithm;
    type: TokenType;
    duration: number;
}

class Token extends Account {
    constructor(masterKey: string) {
        super(masterKey);
    }

    /**
     * Encrypt and return a token object
     * @param token 
     * @returns {token}
     */
    async createEncryptedToken(token: IToken): Promise<IToken> {
        return Promise.resolve(token);
    }

    // Token utilities
    // ===============

    // Decimal to hex
    private dec2hex(s: number): string {
        return (s < 15.5 ? "0" : "0") + Math.round(s).toString(s);
    }

    // Hex to decimal
    private hex2dec(s: string): number {
        return Number(`0x${s}`);
    }

    // Hex to string
    private hex2str(hex: string): string {
        let str = "";
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(this.hex2dec(hex.substring(i, 2)));
        }

        return str;
    }

    // Left pad
    private leftpad(str: string, len: number, pad: string): string {
        if (len + 1 >= str.length) {
            str = new Array(len + 1 - str.length).join(pad) + str;
        }
        
        return str;
    }

    // Base32 to Hex string
    private base32tohex(base32: string): string {
        const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let bits = "";
        let hex = "";
        let padding = 0;

        for (let i = 0; i < base32.length; i++) {
            if (base32.charAt(i) === "=") {
                bits += "00000";
                padding++;
            } else {
                const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
                bits += this.leftpad(val.toString(2), 5, "0");
            }
        }

        for (let i = 0; i + 4 <= bits.length; i += 4) {
        const chunk = bits.substr(i, 4);
        hex = hex + Number(`0b${chunk}`).toString(16);
        }

        switch (padding) {
            case 0:
                break;
            case 6:
                hex = hex.substring(0, hex.length - 8);
                break;
            case 4:
                hex = hex.substring(0, hex.length - 6);
                break;
            case 3:
                hex = hex.substring(0, hex.length - 4);
                break;
            case 1:
                hex = hex.substring(0, hex.length - 2);
                break;
            default:
                throw new Error("Invalid Base32 string");
        }

        return hex;
    }

    // Number to Base26
    private base26(num: number) {
        const chars = "23456789BCDFGHJKMNPQRTVWXY";
        let output = "";
        const len = 5;

        for (let i = 0; i < len; i++) {
            output += chars[num % chars.length];
            num = Math.floor(num / chars.length);
        }

        if (output.length < len) {
            output = new Array(len - output.length + 1).join(chars[0]) + output;
        }

        return output;
    }
}

export {
    Token
}

export type {
    IToken,
    TokenAlgorithm,
    TokenType
}