import { api } from "@/service/api/api";
import type { AxiosResponse } from "axios";

export default {
    CreateVault(encryptedData: string): Promise<AxiosResponse> {
        return api.post("/v1/vault", {
            data: encryptedData
        });
    }
}