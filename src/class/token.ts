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
}

export {
    Token
}

export type {
    IToken,
    TokenAlgorithm,
    TokenType
}