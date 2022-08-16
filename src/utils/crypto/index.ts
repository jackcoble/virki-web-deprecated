import type { Keys } from "@/types/user";
import * as libsodium from "@/utils/crypto/libsodium";

export async function generateKeys(password: string) {
    // Master and recovery keys
    const masterKey = await libsodium.generateEncryptionKey();
    const recoveryKey = await libsodium.generateEncryptionKey();

    // Derive Key Encryption Key
    const kek = await libsodium.deriveKeyEncryptionKey(password);

    // Encrypt the master key with the KEK and recovery key,
    // and then recovery key with master key.
    const masterKeyEncryptedWithKek = await libsodium.encryptToB64(masterKey, kek.key);
    const masterKeyEncryptedWithRecoveryKey = await libsodium.encryptToB64(masterKey, recoveryKey);
    const recoveryKeyEncryptedWithMasterKey = await libsodium.encryptToB64(recoveryKey, masterKey);

    // Generate an X25519 keypair and encrypt private key with master key.
    const keypair = await libsodium.generateKeypair();
    const encryptedKeypair = await libsodium.encryptToB64(keypair.privateKey, masterKey);

    // Construct a Keys object containing everything we need for encryption.
    const keys: Keys = {
        kek: {
            salt: kek.salt,
            opsLimit: kek.opsLimit,
            memLimit: kek.memLimit
        },
        master: {
            key: masterKeyEncryptedWithKek.ciphertext,
            nonce: masterKeyEncryptedWithKek.nonce
        },
        keypair: {
            publicKey: keypair.publicKey,
            privateKey: encryptedKeypair.ciphertext,
            privateKeyNonce: encryptedKeypair.nonce
        },
        recovery: {
            masterKey: masterKeyEncryptedWithRecoveryKey.ciphertext,
            masterKeyNonce: masterKeyEncryptedWithRecoveryKey.nonce,

            recoveryKey: recoveryKeyEncryptedWithMasterKey.ciphertext,
            recoveryKeyNonce: recoveryKeyEncryptedWithMasterKey.nonce
        }
    }
    
    return Promise.resolve(keys);
}