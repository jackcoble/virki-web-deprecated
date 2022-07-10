import { useAuthenticationStore } from "@/stores/authenticationStore";
import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
        "Content-Type": "application/json"
    }
})

// If we've got an access token in the store,
// attach it to every request
api.interceptors.request.use(
    config => {
        const authenticationStore = useAuthenticationStore();
        const accessToken = authenticationStore.getAccessToken;

        if (config.headers && accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
)