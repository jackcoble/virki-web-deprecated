import * as Comlink from "comlink";
import type { ComlinkWorker } from "@/utils/comlink";

// Fetch the dedicated worker for Crypto actions
export const getDedicatedCryptoWorker = (): ComlinkWorker => {
    const worker = new Worker(
        new URL("worker/crypto.worker.js", import.meta.url),
        { name: "authoriser-crypto-worker" }
    );

    const comlink = Comlink.wrap(worker);
    return {
        comlink, 
        worker
    };
}