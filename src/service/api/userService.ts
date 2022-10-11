import { api } from "@/service/api/api";
import type { Keys } from "@/types/user";
import type { AxiosResponse } from "axios";

export default {
    PreLogin(email: string): Promise<AxiosResponse> {
        return api.post("/v1/users/prelogin", {
            email: email
        })
    },

    Login(email: string, password: string, turnstileToken: string): Promise<AxiosResponse> {
        const headers = {
            "X-Turnstile-Token": turnstileToken
        }

        return api.post("/v1/users/login", {
            email: email,
            password: password
        }, { headers })
    },


    Register(email: string, keys: Keys, turnstileToken: string): Promise<AxiosResponse> {
        const headers = {
            "X-Turnstile-Token": turnstileToken
        }

        return api.post("/v1/users/register", {
            email: email,
            encrypted_keys: keys
        }, { headers })
    },

    GetKeys(): Promise<AxiosResponse> {
        return api.get("/v1/users/keys");
    },

    GetAccount(): Promise<AxiosResponse> {
        return api.get("/v1/users/account");
    },

    GetSessions(): Promise<AxiosResponse> {
        return api.get("/v1/users/sessions")
    },

    RevokeSession(sessionID: string): Promise<AxiosResponse> {
        return api.post("/v1/users/sessions/revoke", {
            session_id: sessionID
        })
    },

    Logout(): Promise<AxiosResponse> {
        return api.post("/v1/users/sessions/logout");
    }
}