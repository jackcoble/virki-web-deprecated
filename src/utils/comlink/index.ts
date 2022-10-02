import * as Comlink from "comlink";
import CWorker from "@/worker/crypto.worker?worker&inline"

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

export const CryptoWorker: any = getDedicatedCryptoWorker()?.comlink;