import { Account, EncryptionType } from "./account";
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
    t_id: string;
    offline: boolean | number // If device is offline, this should be a timestamp of when it went offline in UNIX time (ms)
    created: number;

    // OTP specific data
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
    digits: number;
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
    async createEncryptedToken(token: IToken, offline?: boolean): Promise<IToken> {
        const encryptedToken = { ...token };

        // If we don't have a token ID for this entry, generate one.
        // It will be in the same format that we use for Vaults.
        if (!encryptedToken.t_id) {
            // Token format: t-d68f86c1fbe145b7bbba0f36b4cdfa6e-v1
            //               [Token Identifier Character]-[UUID]-[Encryption Type]
            let tokenId = window.crypto.randomUUID();
            tokenId = tokenId.replace(/-/g, "");
            tokenId = `t-${tokenId}-v${EncryptionType.OPENPGP}`;

            encryptedToken.t_id = tokenId;
        }

        // We should encrypt the following data:
        // - Issuer
        // - Account
        // - Secret
        // - Icon (if available)
        encryptedToken.issuer = await this.encryptData(token.issuer);
        encryptedToken.account = await this.encryptData(token.account);
        encryptedToken.secret = await this.encryptData(token.secret);

        if (encryptedToken.icon) {
            encryptedToken.icon.data = await this.encryptData(encryptedToken.icon.data);
            encryptedToken.icon.url = await this.encryptData(encryptedToken.icon.url);
        }

        // If device is offline, set the offline timestamp as current device UNIX time (microseconds)
        const currentUnixMilliseconds = Math.floor(Date.now() * 1000);
        if (offline === true) {
            encryptedToken.offline = currentUnixMilliseconds;
        } else {
            encryptedToken.offline = false;
        }

        // Set the created time as current UNIX time if not already set
        if (!encryptedToken.created) {
            encryptedToken.created = currentUnixMilliseconds;
        }
        
        return Promise.resolve(encryptedToken);
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