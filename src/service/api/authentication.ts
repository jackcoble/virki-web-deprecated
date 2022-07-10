import { api } from "@/service/api/api";

import type { AxiosResponse } from "axios";
import type { IRegisterAccount } from "@/models/account";

export default {
    RegisterAccount(payload: IRegisterAccount): Promise<AxiosResponse> {
        return api.post("/v1/auth/register", payload)
    },

    PreLogin(email: string): Promise<AxiosResponse> {
        return api.post("/v1/auth/prelogin", {
            email: email
        })
    },

    Login(email: string, password: string): Promise<AxiosResponse> {
        return api.post("/v1/auth/login", {
            email: email,
            password: password
        })
    }
}