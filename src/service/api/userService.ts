import { api } from "@/service/api/api";
import type { AxiosResponse } from "axios";
import type { AccountRegistrationRequestBody, AccountRegistrationResponseBody, GetKeysResponse, GetVaultsResponseBody, VaultCreationRequestBody, VaultCreationResponseBody } from "./types";

export default {
    Register(payload: AccountRegistrationRequestBody): Promise<AxiosResponse<AccountRegistrationResponseBody>> {
        return api.post("/v1/account/register", payload);
    },

    GetKeys(): Promise<AxiosResponse<GetKeysResponse>> {
        return api.get("/v1/account/keys");
    },

    CreateVault(payload: VaultCreationRequestBody): Promise<AxiosResponse<VaultCreationResponseBody>> {
        return api.post("/v1/vaults", payload);
    },

    GetVaults(): Promise<AxiosResponse<GetVaultsResponseBody[]>> {
        return api.get("/v1/vaults");
    }
}