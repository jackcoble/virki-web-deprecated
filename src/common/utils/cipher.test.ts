import { describe, expect, test } from "vitest";
import { parseCipherString, serialiseCipherString } from "./cipher";
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
})

describe("serialiseCipherString", () => {
    test("should serialise a valid XCHACHA20_POLY1305 cipher string", async () => {
        const parameters = {
            encryptionType: 1, // XCHACHA20_POLY1305
            cipherText: "CipherText",
            nonce: "Nonce",
            mac: "MAC"
        }

        const cipherString = await serialiseCipherString(parameters.encryptionType, parameters.cipherText, parameters.nonce, parameters.mac);
        expect(cipherString).toBeDefined();
    })
})