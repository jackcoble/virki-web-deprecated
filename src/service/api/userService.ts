import { api } from "@/service/api/api";
import type { AxiosResponse } from "axios";
import type { EncryptedFile } from "@/common/interfaces/file";
import type { AccountRegistrationRequestBody } from "./types";

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

    Register(payload: AccountRegistrationRequestBody): Promise<AxiosResponse> {
        return api.post("/v1/account/register", payload)
    },

    GetKeys(): Promise<AxiosResponse> {
        return api.get("/v1/account/keys");
    },

    GetAccount(): Promise<AxiosResponse> {
        return api.get("/v1/users/account");
    },

    UploadFile(file: EncryptedFile): Promise<AxiosResponse> {
        return api.post("/v1/users/files", {
            file_encryption_header: file.file_encryption_header,
            mime_type: file.mime_type,
            encryption_key: file.encryption_key,
            key: file.object_key,
        })
    },

    GetFile(key: string) {
        return api.get(`/v1/users/files?key=${key}`)
    },

    GetAvatar(): Promise<AxiosResponse> {
        return api.get("/v1/users/files/avatar")
    },

    UpdateEmail(email: string, masterPassword: string) {
        return api.post("/v1/users/update/email", {
            email: email,
            password: masterPassword
        })
    },

    UpdateName(name: string) {
        return api.post("/v1/users/update/name", {
            name: name
        })
    },

    UpdateAvatar(key: string) {
        return api.post("/v1/users/update/avatar", {
            key: key
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