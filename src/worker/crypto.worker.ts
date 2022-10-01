import * as Comlink from "comlink";
import { stretchPassword } from "@/common/utils/password";
import { encryptToB64, encryptUTF8, generateEncryptionKey, generateKeypair, decryptFromB64 } from "@/common/utils/sodium";

export class Crypto {
    async stretchPassword(password: string, salt?: string, opsLimit?: number, memLimit?: number) {
        return stretchPassword(password, salt, opsLimit, memLimit);
    }

    async generateEncryptionKey() {
        return generateEncryptionKey();
    }

    async generateKeypair() {
        return generateKeypair();
    }

    async encryptToB64(data: string, key?: string) {
        return encryptToB64(data, key);
    }

    async encryptUTF8(data: string, key?: string) {
        return encryptUTF8(data, key);
    }

    async decryptFromB64(ciphertext: string, mac: string, nonce: string, key: string) {
        return decryptFromB64(ciphertext, mac, nonce, key)
    }
}

Comlink.expose(Crypto)