import * as Comlink from "comlink";
import { stretchPassword } from "@/common/utils/password";
import { encryptToB64, encryptUTF8, generateEncryptionKey } from "@/common/utils/sodium";

export class Crypto {
    async stretchPassword(password: string) {
        return stretchPassword(password);
    }

    async generateEncryptionKey() {
        return generateEncryptionKey();
    }

    async encryptToB64(data: string, key?: string) {
        return encryptToB64(data, key);
    }

    async encryptUTF8(data: string, key?: string) {
        return encryptUTF8(data, key);
    }
}

Comlink.expose(Crypto)