import { api } from "@/service/api/api";
import type { Keys } from "@/types/user";
import type { AxiosResponse } from "axios";

export default {
    SendOTP(email: string): Promise<AxiosResponse> {
        return api.post("/v1/users/otp", {
            email: email
        })
    },

    VerifyOTP(email: string, otp: number): Promise<AxiosResponse> {
        return api.post("/v1/users/otp/verify", {
            email: email,
            otp: otp
        })
    },

    AddEncryptedKeys(keys: Keys): Promise<AxiosResponse> {
        return api.put("/v1/users/keys", keys);
    },

    GetAccount(): Promise<AxiosResponse> {
        return api.get("/v1/users/account");
    },

    GetSessions(): Promise<AxiosResponse> {
        return api.get("/v1/users/sessions")
    },

    WebAuthnRegister(): Promise<AxiosResponse> {
        return api.post("/v1/users/webauthn/register")
    },

    WebAuthnFinishRegister(sessionId: string, attestationObject: any): Promise<AxiosResponse> {
        return api.post(`/v1/users/webauthn/register/${sessionId}`, attestationObject)
    },

    Logout(): Promise<AxiosResponse> {
        return api.post("/v1/users/sessions/logout");
    }
}