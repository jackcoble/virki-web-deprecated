import { describe, expect, test } from "vitest";
import { parseCipherString } from "./cipher";
import { EncryptionType } from "../enums/encryptionType";

describe("parseCipherString", () => {
    test("should parse a valid XCHACHA20_POLY1305 cipher string", async () => {
        const validCipherString = "1.CipherText|Nonce|MAC";
        const result = await parseCipherString(validCipherString);

        expect(result).toEqual({
            type: EncryptionType.XCHACHA20_POLY1305,
            ciphertext: "CipherText",
            nonce: "Nonce",
            mac: "MAC"
        })
    })

    test("should handle invalid encryption type", async () => {
        const invalidCipherString = "999.CipherText|Nonce|MAC";
        await expect(parseCipherString(invalidCipherString)).rejects.toEqual("Encryption type is invalid!")
    })

    test("should handle missing properties depending on the encryption type", () => {
        // TODO...
    })
}) 