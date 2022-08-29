import * as Comlink from "comlink";
import * as crypto from "@/utils/crypto";
import type { Keys } from "@/types/user";
import * as libsodium from "@/utils/crypto/libsodium";

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

    async encryptToB64 (data: string, key?: string) {
        return libsodium.encryptToB64(data, key);
    }

    async encryptUTF8 (data: string, key?: string) {
        return libsodium.encryptUTF8(data, key);
    }

    async decryptToUTF8(key: string, cipherString: string) {
        return crypto.decryptToUTF8(key, cipherString)
    }

    async generateEncryptionKey() {
        return libsodium.generateEncryptionKey();
    }

    async boxSealOpen(input: string, publicKey: string, privateKey: string) {
        return libsodium.boxSealOpen(input, publicKey, privateKey);
    }

    async fromBase64 (input: string) {
        return libsodium.fromBase64(input);
    }
}

Comlink.expose(Crypto)