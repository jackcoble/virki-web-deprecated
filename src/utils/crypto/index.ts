import { EncryptionType } from "@/types/crypto";
import type { Keys } from "@/types/user";
import * as libsodium from "@/utils/crypto/libsodium";
import { serialiseCipherString, parseCipherString } from "./cipher";

export async function generateKeys(password: string): Promise<Keys> {
    // Master and recovery keys
    const masterKey = await libsodium.generateEncryptionKey();
    const recoveryKey = await libsodium.generateEncryptionKey();

    // Derive Key Encryption Key
    const kek = await libsodium.deriveKeyEncryptionKey(password);
    if (!kek) {
        return Promise.reject("Key encryption key cannot be null!");
    }

    // Encrypt the master key with the KEK and recovery key,
    // and then recovery key with master key.
    const masterKeyEncryptedWithKek = await libsodium.encryptToB64(masterKey, kek.key);
    const masterKeyEncryptedWithRecoveryKey = await libsodium.encryptToB64(masterKey, recoveryKey);
    const recoveryKeyEncryptedWithMasterKey = await libsodium.encryptToB64(recoveryKey, masterKey);

    // Generate cipher strings for all of the keys
    const masterKeyEncryptedWithKekCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, masterKeyEncryptedWithKek.ciphertext, masterKeyEncryptedWithKek.nonce, masterKeyEncryptedWithKek.mac);
    const masterKeyEncryptedWithRecoveryKeyCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, masterKeyEncryptedWithRecoveryKey.ciphertext, masterKeyEncryptedWithRecoveryKey.nonce, masterKeyEncryptedWithRecoveryKey.mac);
    const recoveryKeyEncryptedWithMasterKeyCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, recoveryKeyEncryptedWithMasterKey.ciphertext, recoveryKeyEncryptedWithMasterKey.nonce, recoveryKeyEncryptedWithMasterKey.mac);

    // Generate an X25519 keypair and encrypt private key with master key.
    const keypair = await libsodium.generateKeypair();
    const encryptedKeypair = await libsodium.encryptToB64(keypair.privateKey, masterKey);
    const encryptedKeyPairCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedKeypair.ciphertext, encryptedKeypair.nonce, encryptedKeypair.mac);

    // Construct a Keys object containing everything we need for encryption.
    const keys: Keys = {
        kek: {
            salt: kek.salt,
            opsLimit: kek.opsLimit,
            memLimit: kek.memLimit
        },
        master_encryption_key: masterKeyEncryptedWithKekCipherString,
        keypair: {
            publicKey: keypair.publicKey,
            privateKey: encryptedKeyPairCipherString
        },
        recovery: {
            masterKeyEncryptedWithRecoveryKey: masterKeyEncryptedWithRecoveryKeyCipherString,
            recoveryKeyEncryptedWithMasterKey: recoveryKeyEncryptedWithMasterKeyCipherString,
        }
    }
    
    return Promise.resolve(keys);
}

export async function decryptKeys(passphrase: string, encryptedKeys: Keys): Promise<Keys> {
    // Derive Key Encryption Key
    const kek = await libsodium.deriveKeyEncryptionKey(passphrase, encryptedKeys.kek.salt, encryptedKeys.kek.opsLimit, encryptedKeys.kek.memLimit);
    if (!kek) {
        return Promise.reject("Key encryption key cannot be null!");
    }

    // Decrypt the master encryption key into Base64
    const mekCipher = await parseCipherString(encryptedKeys.master_encryption_key);
    const masterEncryptionKey = await libsodium.decryptFromB64(
        mekCipher.ciphertext,
        mekCipher.mac,
        mekCipher.nonce,
        kek.key
    );

    // Decrypt the keypair with the master encryption key
    const kpCipher = await parseCipherString(encryptedKeys.keypair.privateKey);
    const kpPrivateKey = await libsodium.decryptFromB64(
        kpCipher.ciphertext,
        kpCipher.mac,
        kpCipher.nonce,
        masterEncryptionKey
    )

    // Decrypt the recovery keys
    // Recovery key encrypted with master key
    const rkewmkCipher = await parseCipherString(encryptedKeys.recovery.recoveryKeyEncryptedWithMasterKey);
    const rkewmk = await libsodium.decryptFromB64(
        rkewmkCipher.ciphertext,
        rkewmkCipher.mac,
        rkewmkCipher.nonce,
        masterEncryptionKey
    )

    // Master key encrypted with recovery key
    const mkewrkCipher = await parseCipherString(encryptedKeys.recovery.masterKeyEncryptedWithRecoveryKey);
    const mkewrk = await libsodium.decryptFromB64(
        mkewrkCipher.ciphertext,
        mkewrkCipher.mac,
        mkewrkCipher.nonce,
        rkewmk
    )

    // Construct an object to be returned containing the decrypted keys
    const decryptedKeys: Keys = {
        kek: {
            salt: kek.salt,
            opsLimit: kek.opsLimit,
            memLimit: kek.memLimit
        },
        master_encryption_key: masterEncryptionKey,
        keypair: {
            publicKey: encryptedKeys.keypair.publicKey,
            privateKey: kpPrivateKey
        },
        recovery: {
            masterKeyEncryptedWithRecoveryKey: mkewrk,
            recoveryKeyEncryptedWithMasterKey: rkewmk,
        }
    }

    return Promise.resolve(decryptedKeys);
}