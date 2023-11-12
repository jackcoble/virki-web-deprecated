import { describe, expect, test } from "vitest";
import { parseCipherString } from "./cipher";
import { EncryptionType } from "../enums/encryptionType";

describe("cipher string deserialisation", () => {
    test("can parse a valid xchacha20-poly1305 cipher string", () => {
        const validCipherString = "1.6y0awkQtDq6iRDFYIB7AGdrRfeUsqHEXLy2URsBILqs=|yuZOckGPqSaT+xDgMgDqan0s9vMe1TrQ|4+H4f501w8qpuWrxSYq3vg==";

        parseCipherString(validCipherString).then(cipherObject => {
            const ciphertext = "6y0awkQtDq6iRDFYIB7AGdrRfeUsqHEXLy2URsBILqs=";
            const nonce = "yuZOckGPqSaT+xDgMgDqan0s9vMe1TrQ";
            const mac = "4+H4f501w8qpuWrxSYq3vg==";

            expect(cipherObject.type).toBe(EncryptionType.XCHACHA20_POLY1305);
            expect(cipherObject.ciphertext).toBe(ciphertext);
            expect(cipherObject.nonce).toBe(nonce);
            expect(cipherObject.mac).toBe(mac);
        })
    })

    test("can handle invalid xchacha20-poly1305 cipher string (incorrect encryption type)", async () => {
        const invalidCipherString = "2.6y0awkQtDq6iRDFYIB7AGdrRfeUsqHEXLy2URsBILqs=|yuZOckGPqSaT+xDgMgDqan0s9vMe1TrQ|4+H4f501w8qpuWrxSYq3vg==";
        await expect(() => parseCipherString(invalidCipherString)).rejects.toThrowError("Encryption type is invalid!")
    })
}) 