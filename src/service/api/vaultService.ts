import type { IVault } from "@/class/vault";
import { api } from "@/service/api/api";
import type { Axios, AxiosResponse } from "axios";

export default {
    CreateVault(vault: IVault): Promise<AxiosResponse> {
        return api.post("/v1/vault", vault);
    },

    UpdateVault(vault: IVault): Promise<AxiosResponse> {
        return api.put("/v1/vault", vault);
    },

    GetVaults(): Promise<AxiosResponse> {
        return api.get("/v1/vaults");
    }
}