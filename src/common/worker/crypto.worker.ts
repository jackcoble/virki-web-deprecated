import * as Comlink from "comlink";
import { stretchPassword } from "@/common/utils/password";
import { encryptToB64, encryptUTF8, generateEncryptionKey, generateKeypair, decryptFromB64, decryptFromB64CipherString, decryptFromB64CipherStringToUTF8, encryptFile, fromBase64, decryptFile } from "@/common/utils/sodium";
import type { StretchedPassword } from "../interfaces/password";
import type { StringKeyPair } from "libsodium-wrappers";
import type { EncryptionResult } from "../interfaces/encryption";
import type { EncryptedFile } from "../interfaces/file";

export interface ICryptoWorker {
    stretchPassword(password: string, salt?: string, opsLimit?: number, memLimit?: number): Promise<StretchedPassword>
    generateEncryptionKey(): Promise<string>
    generateKeypair(): Promise<StringKeyPair>
    encryptToB64(data: string, key?: string): Promise<EncryptionResult>
    encryptUTF8(data: string, key?: string): Promise<EncryptionResult>
    decryptFromB64(ciphertext: string, mac: string, nonce: string, key: string): Promise<string>
    decryptFromB64CipherString(cipherString: string, key: string): Promise<string>
    decryptFromB64CipherStringToUTF8(cipherString: string, key: string): Promise<string>
    encryptFile(fileType: string, fileContent: Uint8Array, object_key: string, encryptionKey?: string): Promise<EncryptedFile>
    decryptFile(content: Uint8Array, mime_type: string, encryption_header: string, encryption_key: string): Promise<Blob>
    fromBase64(input: string): Promise<Uint8Array>
}

export class Crypto implements ICryptoWorker {
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
        return decryptFromB64CipherStringToUTF8(cipherString, key);
    }

    // Files
    async encryptFile(fileType: string, fileContent: Uint8Array, object_key: string, encryptionKey?: string) {
        return encryptFile(fileType, fileContent, object_key, encryptionKey);
    }

    async decryptFile(content: Uint8Array, mime_type: string, encryption_header: string, encryption_key: string) {
        return decryptFile(content, mime_type, encryption_header, encryption_key);
    }

    // String utilities
    async fromBase64(input: string) {
        return fromBase64(input);
    }
}

Comlink.expose(Crypto)