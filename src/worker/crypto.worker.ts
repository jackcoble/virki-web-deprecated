import { expose } from "comlink";
import * as crypto from "@/utils/crypto";
import type { Keys } from "@/types/user";
import { fromBase64 } from "@/utils/crypto/libsodium";

export const Crypto = {
    generateKeys (passphrase: string) {
        return crypto.generateKeys(passphrase);
    },

    decryptKeys (passphrase: string, keys: Keys) {
        return crypto.decryptKeys(passphrase, keys);
    },

    decrypt (key: string, cipherString: string) {
        return crypto.decrypt(key, cipherString);
    },

    fromBase64 (input: string) {
        fromBase64(input);
    }
}

expose(Crypto)