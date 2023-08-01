import {
    AuthApi,
    Configuration,
    VaultsApi
} from "virki-axios"

export class VirkiAPI {
    private configuration: Configuration;

    public authApi: AuthApi;
    public vaultsApi: VaultsApi;

    /**
     * Initialise the constructor
     */
    constructor() {
        this.configuration = new Configuration({
            basePath: "/api"
        });

        this.authApi = new AuthApi(this.configuration);
        this.vaultsApi = new VaultsApi(this.configuration);
    }
}

export const api = new VirkiAPI();