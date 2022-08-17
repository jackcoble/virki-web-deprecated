import { expose } from "comlink";
import * as crypto from "@/utils/crypto";

export const Crypto = {
    generateKeys (passphrase: string) {
        return crypto.generateKeys(passphrase);
    } 
}

expose(Crypto)