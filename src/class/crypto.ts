import * as sodium from "libsodium-wrappers";

export class Crypto {
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