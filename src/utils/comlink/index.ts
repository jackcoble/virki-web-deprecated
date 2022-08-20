import * as Comlink from "comlink";

export interface ComlinkWorker {
    comlink: any;
    worker: Worker;
}


// Returns a Crypto worker
export const getDedicatedCryptoWorker = (): ComlinkWorker => {
    const workerFile = new URL("../../worker/crypto.worker.ts", import.meta.url);
    const worker = new Worker(workerFile, { type: "module" });

    const comlink = Comlink.wrap(worker);
    return { comlink, worker };
}

export const CryptoWorker: any = getDedicatedCryptoWorker()?.comlink;