import Dexie, { type Table } from "dexie";
import type { GetVaultsResponseBody } from "../api/types";

export class StorageService extends Dexie {
    // Maintains the following:
    // - Vaults
    private vaults!: Table<GetVaultsResponseBody>

    /**
     * Constructor
     */
    constructor() {
        super("virki_db");
        this.version(1).stores({
            vaults: "id"
        })
    }

    /**
     * Adds a Vault to the DB
     * @param vault - Encrypted copy of the Vault
     */
    async addVault(vault: GetVaultsResponseBody) {
        await this.vaults.put(vault);
    }
}

// Export access to the DB as a singleton
export default new StorageService();