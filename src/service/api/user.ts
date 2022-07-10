import { api } from "@/service/api/api";
import type { AxiosResponse } from "axios";

export default {
    GetAccount(): Promise<AxiosResponse> {
        return api.get("/v1/account");
    }
}