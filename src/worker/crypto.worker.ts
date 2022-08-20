import * as Comlink from "comlink";
import * as crypto from "@/utils/crypto";
import type { Keys } from "@/types/user";
import { fromBase64 } from "@/utils/crypto/libsodium";

export class Crypto {
    async generateKeys (passphrase: string) {
        return crypto.generateKeys(passphrase);
    }

    async decryptKeys (passphrase: string, keys: Keys) {
        return crypto.decryptKeys(passphrase, keys);
    }

    async decrypt (key: string, cipherString: string) {
        return crypto.decrypt(key, cipherString);
    }

    async fromBase64 (input: string) {
        return fromBase64(input);
    }
}

Comlink.expose(Crypto)