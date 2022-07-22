import { Account, EncryptionType } from "./account";
import * as OTPAuth from 'otpauth';

// Enums for Algorithm and Type
enum TokenAlgorithm {
    "SHA-1" = 0,
    "SHA-256",
    "SHA-512"
}

enum TokenType {
    TOTP = 0
}

// Interface describing the properties a "Token" entry should have
interface IToken {
    t_id: string;
    v_id: string; // Vault the token belongs to
    offline: boolean | number // If device is offline, this should be a timestamp of when it went offline in UNIX time (ms)
    created: number;

    // OTP specific data
    issuer: string;
    account: string;
    secret: string;
    icon?: string;
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
            encryptedToken.icon = await this.encryptData(encryptedToken.icon);
        }

        // If device is offline, set the offline timestamp as current device UNIX time (microseconds)
        const currentUnixMilliseconds = Math.floor(Date.now() * 1000);
        if (offline === true) {
            encryptedToken.offline = currentUnixMilliseconds;
        }
        
        // Set the created time as current UNIX time if not already set
        if (!encryptedToken.created) {
            encryptedToken.created = currentUnixMilliseconds;
        }
        
        return Promise.resolve(encryptedToken);
    }

    /**
     * Returns a decrypted Token object
     * @param encryptedToken 
     * @returns 
     */
    async decryptToken(encryptedToken: IToken): Promise<IToken> {
        // Create a copy of the encrypted token for us to work with.
        const decryptedToken = { ...encryptedToken };

        // Parse the token ID to extract the encryption type
        const splitTokenID = decryptedToken.t_id.split("-");
        const encryptionType = parseInt(splitTokenID[2].substring(1));

        if (encryptionType) {
            switch (encryptionType) {
                // Decrypt using OpenPGP.js
                case EncryptionType.OPENPGP:
                    // The properties we are mainly interested in are Issuer, Account, Secret and Icon (if available)  
                    decryptedToken.issuer = await this.decryptData(encryptedToken.issuer);
                    decryptedToken.account = await this.decryptData(encryptedToken.account);
                    decryptedToken.secret = await this.decryptData(encryptedToken.secret);
                    
                    if (decryptedToken.icon) {
                        // If icon is available on the copy of the object, it's available here too..
                        decryptedToken.icon = await this.decryptData(encryptedToken.icon!);
                    }

                    break;
            
                // We have no other encryption types, so something went wrong here...
                default:
                    return Promise.reject("Encryption type is not supported!");
            }
        } else {
            return Promise.reject("Could not determine encryption type!")
        }

        return Promise.resolve(decryptedToken);
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
        // If there is no algorithm provided, default to SHA-1
        if (!algorithm) {
            algorithm = TokenAlgorithm["SHA-1"];
        }

        // Authoriser only supports TOTP generation at the moment,
        // due to being reliant upon the otpauth library. When we have the
        // chance, implement the algorithms ourselves.
        switch (type) {
            case TokenType.TOTP:
                const totp = new OTPAuth.TOTP({
                    secret: secret,
                    algorithm: TokenAlgorithm[algorithm],
                    digits: digits,
                    period: period
                });

                return totp.generate();
        
            default:
                break;
        }
    }

    // IndexedDB Methods
    // =================

    /**
     * Save encrypted into IndexedDB
     * @param token 
     */
    async saveTokenInDB(token: IToken): Promise<any> {
        await this.authoriserDB.tokens.put(token);
    }

    /**
     * Return all encrypted tokens from IndexedDB
     * @returns {IToken}
     */
    async getTokensInDB(): Promise<IToken[]> {
        const tokens = await this.authoriserDB.tokens.toArray();
        return tokens;
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