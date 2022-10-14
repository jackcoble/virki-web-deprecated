import type { Vault } from "@/common/interfaces/vault";
import type { AxiosResponse } from "axios";
import { api } from "./api";

export default {
    addVault(vault: Vault): Promise<AxiosResponse> {
        return api.post("/vaults", vault);
    }
}