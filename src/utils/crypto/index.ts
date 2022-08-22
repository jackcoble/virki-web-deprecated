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
            ops_limit: kek.opsLimit,
            mem_limit: kek.memLimit
        },
        master_encryption_key: masterKeyEncryptedWithKekCipherString,
        keypair: {
            public_key: keypair.publicKey,
            private_key: encryptedKeyPairCipherString
        },
        recovery: {
            master_key_encrypted_with_recovery_key: masterKeyEncryptedWithRecoveryKeyCipherString,
            recovery_key_encrypted_with_master_key: recoveryKeyEncryptedWithMasterKeyCipherString,
        }
    }
    
    return Promise.resolve(keys);
}

export async function decryptKeys(passphrase: string, encryptedKeys: Keys): Promise<Keys> {
    // Derive Key Encryption Key
    const kek = await libsodium.deriveKeyEncryptionKey(passphrase, encryptedKeys.kek.salt, encryptedKeys.kek.ops_limit, encryptedKeys.kek.mem_limit);
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
    const kpCipher = await parseCipherString(encryptedKeys.keypair.private_key);
    const kpPrivateKey = await libsodium.decryptFromB64(
        kpCipher.ciphertext,
        kpCipher.mac,
        kpCipher.nonce,
        masterEncryptionKey
    )

    // Decrypt the recovery keys
    // Recovery key encrypted with master key
    const rkewmkCipher = await parseCipherString(encryptedKeys.recovery.recovery_key_encrypted_with_master_key);
    const rkewmk = await libsodium.decryptFromB64(
        rkewmkCipher.ciphertext,
        rkewmkCipher.mac,
        rkewmkCipher.nonce,
        masterEncryptionKey
    )

    // Master key encrypted with recovery key
    const mkewrkCipher = await parseCipherString(encryptedKeys.recovery.master_key_encrypted_with_recovery_key);
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
            ops_limit: kek.opsLimit,
            mem_limit: kek.memLimit
        },
        master_encryption_key: masterEncryptionKey,
        keypair: {
            public_key: encryptedKeys.keypair.public_key,
            private_key: kpPrivateKey
        },
        recovery: {
            master_key_encrypted_with_recovery_key: mkewrk,
            recovery_key_encrypted_with_master_key: rkewmk,
        }
    }

    return Promise.resolve(decryptedKeys);
}

// Decrypt a cipher string using a symmetric key
export async function decrypt(key: string, cipherString: string): Promise<string> {
    const cipher = await parseCipherString(cipherString);

    const decrypted = await libsodium.decryptFromB64(
        cipher.ciphertext,
        cipher.mac,
        cipher.nonce,
        key
    );

    return Promise.resolve(decrypted);
}

// Generate a symmetric encryption key
export async function generateEncryptionKey(): Promise<string> {
    const encryptionKey = await libsodium.generateEncryptionKey();
    return Promise.resolve(encryptionKey);
}