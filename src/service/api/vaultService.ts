import type { EncryptedVault } from "@/class/vault";
import { api } from "@/service/api/api";
import type { Axios, AxiosResponse } from "axios";

export default {
    CreateVault(vault: EncryptedVault): Promise<AxiosResponse> {
        return api.post("/v1/vault", vault);
    },

    UpdateVault(vault: EncryptedVault): Promise<AxiosResponse> {
        return api.put("/v1/vault", {
            id: vault.id,
            data: vault.data
        })
    },

    GetVaults(): Promise<AxiosResponse> {
        return api.get("/v1/vaults");
    }
}