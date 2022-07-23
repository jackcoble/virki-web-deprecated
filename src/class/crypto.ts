import * as sodium from "libsodium-wrappers";

// Structure of an X25519 keypair
interface KeyPair {
    publicKey: string;
    privateKey: string;
}

export class Crypto {
    /**
     * Generates a random X25519 keypair encoded in Base64 format.
     * @returns {KeyPair}
     */
    static async generateKeyPair(): Promise<KeyPair> {
        await sodium.ready;
        const keyPair = sodium.crypto_box_keypair();

        return {
            publicKey: await this.toBase64(keyPair.publicKey),
            privateKey: await this.toBase64(keyPair.privateKey)
        }
    }

    /**
     * Converts Uint8Array to Base64 string.
     * @param input 
     * @returns {string}
     */
    static async toBase64(input: Uint8Array): Promise<string> {
        await sodium.ready;
        return sodium.to_base64(input, sodium.base64_variants.ORIGINAL);
    }

    /**
     * Converts Base64 encoded string into Uint8Array.
     * @param input 
     * @returns {Uint8Array}
     */
    static async fromBase64(input: string): Promise<Uint8Array> {
        await sodium.ready;
        return sodium.from_base64(input, sodium.base64_variants.ORIGINAL);
    }
}