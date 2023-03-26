enum UUIDType {
    Vault = "v",
    Token = "t",
    File  = "f"
}

enum UUIDVersion {
    V1 = 1
}

export class Utils {
    /**
     * Generates a UUID for a vault, token or file (attachment)
     * @param len - Length of the UUID to be genereated
     */
    static generateUUID(type: UUIDType, version: UUIDVersion, len?: number): string {
        const randomArray = new Uint8Array((len || 32) / 2);
        crypto.getRandomValues(randomArray);
        const randomId = Array.from(randomArray, this.dec2hex).join('');

        // We have the random identifier value, so construct the full ID depending on the UUID Type and Version
        const id = `${type}-${randomId}-v${version}`;
        return id;
    }

    /**
     * Converts decimal value to Hexadecimal string
     * @param decimal 
     * @returns 
     */
    private static dec2hex(decimal: number): string {
        return ('0' + decimal.toString(16)).substring(-2); 
    }
}