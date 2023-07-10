import * as Comlink from "comlink";
import CWorker from "@/common/worker/crypto.worker?worker&inline"
import type { ICryptoWorker } from "../worker/crypto.worker";

export interface ComlinkWorker {
    comlink: ICryptoWorker;
    worker: Worker;
}


// Returns a Crypto worker
export const getDedicatedCryptoWorker = (): ComlinkWorker => {
    const worker = new CWorker()

    const comlink = Comlink.wrap(worker) as ICryptoWorker;
    return { comlink, worker };
}

export const CryptoWorker = getDedicatedCryptoWorker()?.comlink;