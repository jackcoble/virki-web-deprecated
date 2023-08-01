import * as Comlink from "comlink";
import { CryptoWorker } from "../worker/crypto.worker"

// Spawns a CryptoWorker inside a Web Worker
export const getDedicatedCryptoWorker = async () => {
    const worker = new Worker(new URL("../worker/crypto.worker", import.meta.url), { type: "module" });
    const instance = Comlink.wrap<typeof CryptoWorker>(worker);
    const cryptoWorker = await new instance();

    return Promise.resolve(cryptoWorker);
}

// Exports a singleton of the available CryptoWorker
export const cryptoWorker = await getDedicatedCryptoWorker().then(worker => worker);