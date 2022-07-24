import type { AxiosResponse } from "axios";
import { api } from "./api";

export default {
    // Status/healthcheck endpoint
    Status(): Promise<AxiosResponse> {
        return api.get("/v1/status");
    }
}