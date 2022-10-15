import type { Vault } from "@/common/interfaces/vault";
import type { AxiosResponse } from "axios";
import { api } from "./api";

export default {
    addVault(vault: Vault): Promise<AxiosResponse> {
        return api.post("/v1/vaults", vault);
    },

    sync(vaults: Vault[]): Promise<AxiosResponse> {
        return api.post("/v1/sync", {
            vaults: vaults
        })
    }
}