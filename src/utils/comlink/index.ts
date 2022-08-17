import * as Comlink from "comlink";

// Returns a Crypto worker
export const getDedicatedCryptoWorker = (): any => {
    const workerFile = new URL("../../worker/crypto.worker.ts", import.meta.url);
    const worker = new Worker(workerFile, { type: "module" });

    const comlink = Comlink.wrap(worker);
    return comlink;
}