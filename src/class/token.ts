import { Account } from "./account";
import * as OTPAuth from 'otpauth';

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

    /**
     * Generate and return a OTP code in string format.
     * @param secret 
     * @param type 
     * @param digits 
     * @param period 
     * @param algorithm 
     * @returns 
     */
    getCode(
        secret: string,
        type: TokenType,
        digits: number,
        period: number,
        algorithm?: TokenAlgorithm
    ) {
        // Authoriser only supports TOTP generation at the moment,
        // due to being reliant upon the otpauth library. When we have the
        // chance, implement the algorithms ourselves.
        switch (type) {
            case TokenType.TOTP:
                const totp = new OTPAuth.TOTP({
                    secret: secret,
                    algorithm: "SHA1",
                    digits: digits,
                    period: period
                });

                return totp.generate();
        
            default:
                break;
        }
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