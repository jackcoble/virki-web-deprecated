import * as Comlink from "comlink";
import { stretchPassword } from "@/common/utils/password";
import { encryptToB64, encryptUTF8, generateEncryptionKey, generateKeypair, decryptFromB64, decryptFromB64CipherString } from "@/common/utils/sodium";

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
        return decryptFromB64(ciphertext, mac, nonce, key);
    }

    async decryptFromB64CipherString(cipherString: string, key: string) {
        return decryptFromB64CipherString(cipherString, key);
    }

    async decryptFromB64CipherStringToUTF8(cipherString: string, key: string) {
        this.decryptFromB64CipherStringToUTF8(cipherString, key);
    }
}

Comlink.expose(Crypto)