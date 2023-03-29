import { useLogout } from "@/composables/useLogout";
import router from "@/router";
import { PAGES } from "@/router/pages";
import { useKeyStore } from "@/stores/keyStore";
import * as apiClient from "@/common/types";
import type { AxiosError } from "axios";

export const api = new apiClient.DefaultApi();

// For the interceptors to work, we need to access the protected Axios property.
// See https://github.com/OpenAPITools/openapi-generator/issues/11799#issuecomment-1153546079 for more details...

// If we've got a session token in the store,
// attach it to every request
//@ts-ignore
api.axios.interceptors.request.use(
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

// Intercept the responses. If we receive a 401, the session
// has been revoked, so force data to be cleared and push to logout.
//@ts-ignore
api.axios.interceptors.response.use(
    response => {
        return response;
    },
    
    (error: AxiosError) => {
        // Something has gone wrong, so lets investigate! First we shall check the status code.
        // If it is 401, then clear all local data and logout.
        if (error.response && error.response.status === 401) {
            console.log("Session token is invalid, clearing data and logging out...");

            useLogout();
            router.push(PAGES.LOGIN);

            return;
        }

        return error;
    }
)