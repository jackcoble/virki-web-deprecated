import { api } from "@/service/api/api";

import type { AxiosResponse } from "axios";
import type { IRegisterAccount } from "@/models/account";

export default {
    RegisterAccount(payload: IRegisterAccount): Promise<AxiosResponse> {
        return api.post("/v1/auth/register", payload)
    }
}