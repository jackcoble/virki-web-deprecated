import { describe, expect, test } from "vitest";
import { parseCipherString } from "./cipher";
import { EncryptionType } from "../enums/encryptionType";

describe("cipher", () => {
    test("can parse a valid cipher string", () => {
        const validCipherString = "1.6y0awkQtDq6iRDFYIB7AGdrRfeUsqHEXLy2URsBILqs=|yuZOckGPqSaT+xDgMgDqan0s9vMe1TrQ|4+H4f501w8qpuWrxSYq3vg==";

        parseCipherString(validCipherString).then(cipherObject => {
            // We expect the values to be parsed correctly
            const ciphertext = "6y0awkQtDq6iRDFYIB7AGdrRfeUsqHEXLy2URsBILqs=";
            const nonce = "yuZOckGPqSaT+xDgMgDqan0s9vMe1TrQ";
            const mac = "4+H4f501w8qpuWrxSYq3vg==";

            expect(cipherObject.type).toBe(EncryptionType.XCHACHA20_POLY1305);
            expect(cipherObject.ciphertext).toBe(ciphertext);
            expect(cipherObject.nonce).toBe(nonce);
            expect(cipherObject.mac).toBe(mac);
        })
    })
}) 