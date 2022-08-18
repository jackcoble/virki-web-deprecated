import { api } from "@/service/api/api";
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

    GetAccount(): Promise<AxiosResponse> {
        return api.get("/v1/account");
    }
}