import {
    AccountApi,
    AuthApi,
    Configuration,
    VaultsApi
} from "virki-axios"

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
            basePath: "/api"
        });

        this.authApi = new AuthApi(this.configuration);
        this.accountApi = new AccountApi(this.configuration);
        this.vaultsApi = new VaultsApi(this.configuration);
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