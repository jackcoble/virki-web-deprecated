import type { StretchedPassword } from "@/common/interfaces/password";
import * as sodiumUtils from "./sodium";
import sodium from "libsodium-wrappers-sumo";

/**
 * Stretches a provided password using Argon2.
 * @param password 
 * @param salt 
 * @param opsLimit 
 * @param memLimit 
 * @returns {StretchedPassword}
 */
 export async function stretchPassword(password: string, salt?: string, opsLimit?: number, memLimit?: number): Promise<StretchedPassword> {
    await sodium.ready;

    // Default algorithm can change in future, so added this in as a safeguard.
    if (sodium.crypto_pwhash_ALG_DEFAULT !== sodium.crypto_pwhash_ALG_ARGON2ID13) {
        return Promise.reject("Mismatch with expected password hashing algorithm!");
    }

    // Generate salt if not provided as parameter
    const saltBuffer = salt ? await sodiumUtils.fromBase64(salt) : await sodiumUtils.fromBase64(await sodiumUtils.generateSalt());

    // Determine opsLimit and memLimit. If not provided, fall-back to the MODERATE values.
    // Further explanation can be found here: https://libsodium.gitbook.io/doc/password_hashing/default_phf#key-derivation
    // Basically this key is used for interactive operations, so we want the right balance of speed and security.
    opsLimit = opsLimit ? opsLimit : sodium.crypto_pwhash_OPSLIMIT_MODERATE;
    memLimit = memLimit ? memLimit : sodium.crypto_pwhash_MEMLIMIT_MODERATE;

    // If any operation fails due to insufficient memory, double the computation allowed and halve the memory limit.
    const minMemLimit = sodium.crypto_pwhash_MEMLIMIT_MIN;
    while (memLimit > minMemLimit) {
        try {
            const key = sodium.crypto_pwhash(sodium.crypto_secretbox_KEYBYTES, password, saltBuffer, opsLimit, memLimit, sodium.crypto_pwhash_ALG_DEFAULT);

            // Generate SHA-512 hash of the stretched password
            const hashedKey = await sodiumUtils.sha512hash(key)

            const stretchedPassword: StretchedPassword = {
                hash: hashedKey,
                key: await sodiumUtils.toBase64(key),
                salt: await sodiumUtils.toBase64(saltBuffer),
                opsLimit: opsLimit,
                memLimit: memLimit
            }

            return Promise.resolve(stretchedPassword);
        } catch (e) {
            opsLimit *= 2;
            memLimit /= 2;
        }
    }

    return Promise.reject("Error stretching provided password!");
}