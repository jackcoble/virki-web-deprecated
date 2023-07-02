import type { Token } from "@/common/interfaces/token";
import type { AxiosResponse } from "axios";
import { api } from "./api";

export default {
    add(encryptedToken: Token): Promise<AxiosResponse> {
        return api.post("/v1/tokens", encryptedToken);
    }
}