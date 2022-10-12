import type { AxiosResponse } from "axios"
import { api } from "./api"

export default {
    CreateSubscription(): Promise<AxiosResponse> {
        return api.post("/v1/billing/paddle/create-subscription")
    }
}