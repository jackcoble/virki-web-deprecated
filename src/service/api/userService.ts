import { api } from "@/service/api/api";
import type { Keys } from "@/common/interfaces/keys";
import type { AxiosResponse } from "axios";
import type { EncryptedFile } from "@/common/interfaces/file";

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

    Register(email: string, name: string, keys: Keys): Promise<AxiosResponse> {
        return api.post("/v1/users/register", {
            email: email,
            name: name,
            encrypted_keys: keys
        })
    },

    GetKeys(): Promise<AxiosResponse> {
        return api.get("/v1/users/keys");
    },

    GetAccount(): Promise<AxiosResponse> {
        return api.get("/v1/users/account");
    },

    UploadAvatar(file: EncryptedFile): Promise<AxiosResponse> {
        return api.post("/v1/users/files", {
            file_encryption_header: file.file_encryption_header,
            mime_type: file.mime_type,
            encryption_key: file.encryption_key,
            key: file.object_key,
            type: "avatar"
        })
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