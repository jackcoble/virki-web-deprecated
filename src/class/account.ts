import { hash, ArgonType } from "argon2-browser/dist/argon2-bundled.min.js";

export class Account {
    private masterKey: Uint8Array;

    constructor(masterKey?: Uint8Array) {
        if (masterKey) {
            this.masterKey = masterKey;
        }
    }
    /**
     * Stretch user password with Argon2
     */
    async deriveStretchedPassword(password: string, salt?: Uint8Array): Promise<any> {
        // Generate salt if not provided as parameter
        if (!salt) {
            salt = window.crypto.getRandomValues(new Uint8Array(8));
        }

        const stretchedKey = await hash({
            pass: password,
            salt: salt,
    /**
     * Set the master key for an account
     * @param masterKey 
     */
    setMasterKey(masterKey: Uint8Array) {
        this.masterKey = masterKey;
    }
    /**
     * Generates a "master key" which is used for OpenPGP encryption of string data
     */
    generateMasterKey(): Uint8Array {
        // 512-bit master key 
        const masterKey = window.crypto.getRandomValues(new Uint8Array(1024));
        return masterKey;
    }
    /**
     * Encrypts the master key with the users stretched password. Returned payload should contain the encrypted master key
     */
    async encryptMasterKey(stretchedKey: string): Promise<string> {
        const masterKeyHex = Buffer.from(this.masterKey).toString("hex");
        const message = await createMessage({
            text: masterKeyHex
        });

        const encryptedMasterKey = await encrypt({
            message,
            passwords: [stretchedKey],
            format: "armored"
        });

        return encryptedMasterKey.toString();
    }
}