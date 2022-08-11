import * as CryptoJS from "crypto-js";
import type { Token as TokenModel } from "@/models/token";
import { Crypto } from "./crypto";

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

export class Token {
    async createEncryptedTokenObject(token: TokenModel, vaultSymmetricKey: string): Promise<TokenModel> {
        // The token document _type should be "token"
        token._type = "token";

        // Create a new object that will contain our encrypted data
        const encryptedToken = Object.assign({}, token);

        // Generate an ID for the token if it hasn't been generated already.
        if (!token._id) {
            let tokenId = window.crypto.randomUUID().replace(/-/g, "");
            encryptedToken._id = `${token._type}:${tokenId}`;
        }

        // Using the vault symmetric key, we can encrypt the relevant data:
        // - Issuer
        // - Label
        // - Secret
        // - Icon (if present)
        const symmetricEncryptionKey = await Crypto.fromBase64(vaultSymmetricKey);

        encryptedToken.issuer = await Crypto.encrypt(await Crypto.fromString(token.issuer), symmetricEncryptionKey);
        encryptedToken.label = await Crypto.encrypt(await Crypto.fromString(token.label), symmetricEncryptionKey);
        encryptedToken.secret = await Crypto.encrypt(await Crypto.fromString(token.secret), symmetricEncryptionKey);
        if (token.icon) {
            encryptedToken.icon = await Crypto.encrypt(await Crypto.fromString(token.icon), symmetricEncryptionKey);
        }

        // Update or set the modified timestamp as current device UNIX time (milliseconds)
        const currentUnixMilliseconds = Math.floor(Date.now());
        encryptedToken.modified = currentUnixMilliseconds;

        // Set the created time as current UNIX time if not already set
        if (!token.created) {
            encryptedToken.created = currentUnixMilliseconds;
        }

        return Promise.resolve(encryptedToken);
    }

    // Generate a TOTP
    static generate(
        type: OTPType,
        secret: string,
        counter: number,
        period: number,
        len?: number,
        algorithm?: OTPAlgorithm
    ) {
        // Remove any formatting from secret
        secret = secret.replace(/\s/g, "");

        // Default length to 6 if not provided
        if (!len) {
            len = 6;
        }

        let b26 = false;
        let key: string;

        // Depending on the OTP type, we need to set some values to properly generate the token.
        switch (type) {
            case OTPType.TOTP:
            case OTPType.HOTP:
                key = this.base32tohex(secret);

                break;

            case OTPType.Steam:
                key = this.base32tohex(secret);
                len = 10;
                b26 = true;

                break;

            default:
                // Default to Base32 if type couldn't be determined.
                key = this.base32tohex(secret);

                break;
        }

        // If theres no key, the secret is invalid.
        if (!key) {
            throw new Error("Invalid secret key!");
        }

        // If the type isn't HOTP, then we need to initialise a counter from the current time
        if (type !== OTPType.HOTP) {
            const epoch = Math.round(new Date().getTime() / 1000.0);
            counter = Math.floor(epoch / period);
        }

        const time = this.leftpad(this.dec2hex(counter), 16, "0");

        // Some black magic going on here, not sure what this does, but it works....
        if (key.length % 2 === 1) {
            if (key.substring(-1) === "0") {
                key = key.substring(0, key.length - 1);
            } else {
                key += "0";
            }
        }

        // Derive the HMAC for specific algorithms
        let hmacObj: CryptoJS.lib.WordArray
        switch (algorithm) {
            // HMAC-SHA256
            case OTPAlgorithm.SHA256:
                hmacObj = CryptoJS.HmacSHA256(
                    CryptoJS.enc.Hex.parse(time),
                    CryptoJS.enc.Hex.parse(key)
                );

                break;

            // HMAC-SHA512
            case OTPAlgorithm.SHA512:
                hmacObj = CryptoJS.HmacSHA512(
                    CryptoJS.enc.Hex.parse(time),
                    CryptoJS.enc.Hex.parse(key)
                );

                break;

            // If no algorithm has been provided we'll default to HMAC-SHA1
            default:
                hmacObj = CryptoJS.HmacSHA1(
                    CryptoJS.enc.Hex.parse(time),
                    CryptoJS.enc.Hex.parse(key)
                );

                break;
        }

        // Conver the hmac object into a hex string and calculate the offset.
        const hmac = CryptoJS.enc.Hex.stringify(hmacObj);
        const offset = this.hex2dec(hmac.substring(hmac.length - 1));

        let otp =
            (this.hex2dec(hmac.substr(offset * 2, 8)) & this.hex2dec("7fffffff")) +
            "";

        // Base26 encode if needed
        if (b26) {
            return this.base26(Number(otp));
        }

        // Otherwise return the OTP
        if (otp.length < len) {
            otp = new Array(len - otp.length + 1).join("0") + otp;
        }
        return otp.substr(otp.length - len, len).toString();
    }

    // =================================
    // Utilities to help generate tokens
    // =================================
    private static dec2hex(s: number): string {
        return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
    }

    private static hex2dec(s: string): number {
        return Number(`0x${s}`);
    }

    private static hex2str(hex: string) {
        let str = "";
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(this.hex2dec(hex.substr(i, 2)));
        }
        return str;
    }

    private static leftpad(str: string, len: number, pad: string): string {
        if (len + 1 >= str.length) {
            str = new Array(len + 1 - str.length).join(pad) + str;
        }
        return str;
    }

    private static base32tohex(base32: string): string {
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
                hex = hex.substr(0, hex.length - 8);
                break;
            case 4:
                hex = hex.substr(0, hex.length - 6);
                break;
            case 3:
                hex = hex.substr(0, hex.length - 4);
                break;
            case 1:
                hex = hex.substr(0, hex.length - 2);
                break;
            default:
                throw new Error("Invalid Base32 string");
        }

        return hex;
    }

    private static base26(num: number) {
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