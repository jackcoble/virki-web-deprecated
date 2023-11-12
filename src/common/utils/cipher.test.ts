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

    test("shouldn't serialise a XCHACHA20_POLY1305 cipher string with invalid encryption type", async () => {
        const parameters = {
            encryptionType: 999,
            cipherText: "CipherText",
            nonce: "Nonce",
            mac: "MAC"
        }

        const result = await expect(serialiseCipherString(parameters.encryptionType, parameters.cipherText, parameters.nonce, parameters.mac)).rejects;
        result.toEqual("Encryption type is invalid!")
    })

    test("shouldn't serialise a XCHACHA20_POLY1305 cipher string with missing parameters", () => {
        const checks = [
            {
                encryptionType: 1, // XCHACHA20_POLY1305
                cipherText: "",
                nonce: "Nonce",
                mac: "MAC"
            },
            {
                encryptionType: 1, // XCHACHA20_POLY1305
                cipherText: "CipherText",
                nonce: "",
                mac: "MAC"
            },
            {
                encryptionType: 1, // XCHACHA20_POLY1305
                cipherText: "CipherText",
                nonce: "Nonce",
                mac: ""
            }
        ]
        
        // Carry out each check
        checks.forEach(async (check, index) => {
            // Different errors we are expecting depending on the check we are running
            const result = expect(serialiseCipherString(check.encryptionType, check.cipherText, check.nonce, check.mac)).rejects;

            switch (index) {
                case 0:
                    result.toEqual("Ciphertext cannot be empty!")
                    break;

                case 1:
                    result.toEqual("Nonce cannot be empty!")
                    break;

                case 2:
                    result.toEqual("MAC cannot be empty!")
                    break;
            
                default:
                    break;
            }
        })
    })
})