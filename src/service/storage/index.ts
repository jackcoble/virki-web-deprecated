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
    async AddVault(vault: GetVaultsResponseBody) {
        await this.vaults.put(vault);
    }

    /**
     * Gets all the Vaults in the DB
     * @returns {GetVaultsResponseBody[]}
     */
    async GetVaults(): Promise<GetVaultsResponseBody[]> {
        const vaults = await this.vaults.toCollection().toArray();
        return vaults;
    }
}

// Export access to the DB as a singleton
export default new StorageService();