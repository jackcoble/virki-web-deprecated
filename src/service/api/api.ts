import { useAuthenticationStore } from "@/stores/authenticationStore";
import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json"
    }
})

// If we've got a session token in the store,
// attach it to every request
api.interceptors.request.use(
    config => {
        const authenticationStore = useAuthenticationStore();
        const sessionToken = "XXX";

        if (config.headers && sessionToken) {
            config.headers.Authorization = sessionToken;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
)