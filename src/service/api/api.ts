import { useAuthenticationStore } from "@/stores/authenticationStore";
import axios from "axios";
import authentication from "./authentication";

export const api = axios.create({
    baseURL: "/api",
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

// Handle 401 Unauthorised response (access token expired)
api.interceptors.response.use(
    response => {
        return response;
    },

    async error => {
        const authenticationStore = useAuthenticationStore();
        const originalRequest = error.config;

        // Handle the unauthroised response if it isn't a retry attempt
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Using the store, fetch current access token and refresh token
            const accessToken = authenticationStore.getAccessToken;
            const refreshToken = authenticationStore.getRefreshToken;

            // Submit both credentials to the API endpoint, expecting a new pair to be returned
            if (accessToken && refreshToken) {
                try {
                    const res = await authentication.RefreshTokens(accessToken, refreshToken);

                    authenticationStore.setAccessToken(res.data.access_token);
                    authenticationStore.setRefreshToken(res.data.refresh_token);
                } catch (e) {
                    console.log("Handle this error:", e);
                    return Promise.reject(e);
                }
            }

            else {
                // TODO: This isn't right, so just force logout and clear all data.
                return Promise.reject("No access or refresh token found.")
            }

            // If we have made it this far, update the Authorization header on the original request
            originalRequest.headers.Authorization = `Bearer ${authenticationStore.getAccessToken}`
            return axios(originalRequest);
        }

        return Promise.reject(error);
    }
)