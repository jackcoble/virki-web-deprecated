import { api } from "@/service/api/api";
import type { AxiosResponse } from "axios";
import type { AccountRegistrationRequestBody, AccountRegistrationResponseBody, FilePresignedURLResponseBody, GetAccountResponseBody, GetKeysResponse, GetVaultsResponseBody, UpdateAccountRequestBody, UpdateVaultRequestBody, VaultCreationRequestBody, VaultCreationResponseBody } from "./types";

export default {
    Register(payload: AccountRegistrationRequestBody): Promise<AxiosResponse<AccountRegistrationResponseBody>> {
        return api.post("/v1/account/register", payload);
    },

    GetAccount(): Promise<AxiosResponse<GetAccountResponseBody>> {
        return api.get("/v1/account");
    },

    GetKeys(): Promise<AxiosResponse<GetKeysResponse>> {
        return api.get("/v1/account/keys");
    },

    UpdateAccount(payload: UpdateAccountRequestBody): Promise<AxiosResponse> {
        return api.put("/v1/account", payload)
    },

    CreateVault(payload: VaultCreationRequestBody): Promise<AxiosResponse<VaultCreationResponseBody>> {
        return api.post("/v1/vaults", payload);
    },

    DeleteVault(vaultId: string): Promise<AxiosResponse> {
        return api.delete(`/v1/vaults/${vaultId}`);
    },

    UpdateVault(vaultId: string, payload: UpdateVaultRequestBody): Promise<AxiosResponse> {
        return api.put(`/v1/vaults/${vaultId}`, payload);
    },

    GetVaults(): Promise<AxiosResponse<GetVaultsResponseBody[]>> {
        return api.get("/v1/vaults");
    },

    GetUploadURL(): Promise<AxiosResponse<FilePresignedURLResponseBody>> {
        return api.get("/v1/files/upload-url")
    }
}