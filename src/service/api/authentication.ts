import { api } from "@/service/api/api";
import type { AxiosResponse } from "axios";

export default {
    RegisterAccount(payload: any): Promise<AxiosResponse> {
        return api.post("/v1/auth/register", payload)
    }
}