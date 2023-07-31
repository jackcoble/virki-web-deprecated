import * as Comlink from "comlink";
import CWorker from "@/common/worker/crypto.worker?worker"

export interface ComlinkWorker {
    comlink: any;
    worker: Worker;
}


// Returns a Crypto worker
export const getDedicatedCryptoWorker = (): ComlinkWorker => {
    const worker = new CWorker()

    const comlink = Comlink.wrap(worker);
    return { comlink, worker };
}

export const cryptoWorker = getDedicatedCryptoWorker().comlink;