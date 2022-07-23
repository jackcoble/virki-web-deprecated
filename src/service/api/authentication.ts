import { api } from "@/service/api/api";

import type { AxiosResponse } from "axios";
import type { IAccount } from "@/class/account";

export default {
    RegisterAccount(payload: IAccount): Promise<AxiosResponse> {
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
    },

    Deauthorise(masterPasswordHash: string): Promise<AxiosResponse> {
        return api.post("/v1/auth/tokens/deauthorise", {
            password: masterPasswordHash
        })
    },

    RefreshTokens(accessToken: string, refreshToken: string): Promise<AxiosResponse> {
        return api.post("/v1/auth/tokens/refresh", {
            access_token: accessToken,
            refresh_token: refreshToken
        })
    }
}