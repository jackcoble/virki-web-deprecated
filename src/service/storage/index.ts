import Dexie, { type Table } from "dexie";
import type { GetVaultsResponseBody } from "../api/types";

export class StorageService extends Dexie {
    // Maintains the following:
    // - Vaults
    vaults!: Table<GetVaultsResponseBody>

    /**
     * Constructor
     */
    constructor() {
        super("virki_db");
        this.version(1).stores({
            vaults: "id"
        })
    }
}

// Export access to the DB as a singleton
export default new StorageService();