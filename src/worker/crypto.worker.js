import * as Comlink from "comlink";
import * as libsodium from "utils/crypto/libsodium";

export class Crypto {
    async deriveEncryptionKey(passphrase, salt, opsLimit, memLimit) {
        return libsodium.deriveEncryptionKey(passphrase, salt, opsLimit, memLimit);
    }
}

// Expose via Comlink
Comlink.expose(Crypto);