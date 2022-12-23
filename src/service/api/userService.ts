import { api } from "@/service/api/api";
import type { Keys } from "@/common/interfaces/keys";
import type { AxiosResponse } from "axios";

export default {
    PreLogin(email: string): Promise<AxiosResponse> {
        return api.post("/v1/users/prelogin", {
            email: email
        })
    },

    Login(email: string, password: string): Promise<AxiosResponse> {
        return api.post("/v1/users/login", {
            email: email,
            password: password
        })
    },

    Register(email: string, keys: Keys): Promise<AxiosResponse> {
        return api.post("/v1/users/register", {
            email: email,
            encrypted_keys: keys
        })
    },

    GetKeys(): Promise<AxiosResponse> {
        return api.get("/v1/users/keys");
    },

    GetAccount(): Promise<AxiosResponse> {
        return api.get("/v1/users/account");
    },

    UploadAvatar(): Promise<AxiosResponse> {
        return api.get("/v1/users/avatar/upload")
    },

    GetAvatar(): Promise<AxiosResponse> {
        return api.get("/v1/users/avatar")
    },

    UpdateEmail(email: string, masterPassword: string) {
        return api.post("/v1/users/email/update", {
            email: email,
            password: masterPassword
        })
    },

    GetUploadURLs(amount?: number): Promise<AxiosResponse> {
        const params = new URLSearchParams();
        if (amount) {
            params.set("amount", amount.toString());
        }

        return api.get("/v1/users/files/upload-urls", { params })
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