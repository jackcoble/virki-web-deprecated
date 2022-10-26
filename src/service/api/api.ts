import { useKeyStore } from "@/stores/keyStore";
import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

// If we've got a session token in the store,
// attach it to every request
api.interceptors.request.use(
    config => {
        const keyStore = useKeyStore();
        const sessionToken = keyStore.getSessionToken;

        if (config.headers && sessionToken) {
            config.headers["X-Auth-Token"] = sessionToken;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
)