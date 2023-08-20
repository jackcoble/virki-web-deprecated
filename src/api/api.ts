import { useUserStore } from "@/stores/userStore";
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
            
            async (error: AxiosError) => {
                // Attempt to refresh tokens
                if (error.response && error.response.status === 401) {
                    const originalRequest = error.config;
                    const userStore = useUserStore();

                    const existingRefreshToken = userStore.getRefreshToken;
                    const newTokens = await this.authApi.v1AuthRefreshPost({
                        refreshToken: existingRefreshToken
                    });

                    // Update the tokens in the store, and for any subsequent requests made by
                    // this API service
                    userStore.setTokens(newTokens.data.accessToken, newTokens.data.refreshToken);
                    this.setAccessToken(newTokens.data.accessToken);

                    // Attempt the request again (with the updated header)
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newTokens.data.accessToken}`;
                    return axios(originalRequest);
                }
        
                return Promise.reject(error);
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