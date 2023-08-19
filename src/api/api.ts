import { useLogout } from "@/composables/useLogout";
import router from "@/router";
import { PAGES } from "@/router/pages";
import type { AxiosError } from "axios";
import axios from "axios";
import {
    AccountApi,
    AuthApi,
    Configuration,
    VaultsApi
} from "virki-axios"

const BASE_PATH = "/api";

export class VirkiAPI {
    private configuration: Configuration;

    public authApi: AuthApi;
    public accountApi: AccountApi;
    public vaultsApi: VaultsApi;

    /**
     * Initialise the constructor
     */
    constructor() {
        this.configuration = new Configuration({
            basePath: BASE_PATH
        });

        // Prepare a base instance of the API configured to handle Refresh tokens
        const baseApi = axios.create();
        baseApi.interceptors.response.use(
            response => {
                return response;
            },
            
            (error: AxiosError) => {
                // Something has gone wrong, so lets investigate! First we shall check the status code.
                // If it is 401, then clear all local data and logout.
                if (error.response && error.response.status === 401) {
                    console.log("Unable to refresh tokens, clearing data and logging out...");
        
                    useLogout();
                    router.push(PAGES.LOGIN);
        
                    return;
                }
        
                return error;
            }
        )

        this.authApi = new AuthApi(this.configuration, BASE_PATH, baseApi);
        this.accountApi = new AccountApi(this.configuration, BASE_PATH, baseApi);
        this.vaultsApi = new VaultsApi(this.configuration, BASE_PATH, baseApi);
    }

    /**
     * Set the Bearer authorization token
     * @param accessToken - JWT Access Token
     */
    setAccessToken(accessToken: string) {
        this.configuration.accessToken = accessToken;
    }
}

export const api = new VirkiAPI();