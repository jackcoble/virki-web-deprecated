import type { Vault } from "@/common/interfaces/vault";
import type { AxiosResponse } from "axios";
import { api } from "./api";

export default {
    addVault(vault: Vault): Promise<AxiosResponse> {
        return api.post("/v1/vaults", vault);
    },

    deleteVault(id: string): Promise<AxiosResponse> {
        return api.delete(`/v1/vaults/${id}`);
    },

    getVaults(): Promise<AxiosResponse> {
        return api.get("/v1/vaults");
    }
}