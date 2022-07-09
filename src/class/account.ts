import { hash, ArgonType } from "argon2-browser/dist/argon2-bundled.min.js";

export class Account {
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
            type: ArgonType.Argon2id
        });

        console.log(stretchedKey.hashHex);
    }
}