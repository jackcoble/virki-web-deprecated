import {
    AccountApi,
    AuthApi,
    Configuration,
    VaultsApi
} from "virki-axios"

export class VirkiAPI {
    private configuration: Configuration;

    public accountApi: AccountApi;
    public authApi: AuthApi;
    public vaultsApi: VaultsApi;

    /**
     * Initialise the constructor
     */
    constructor() {
        this.configuration = new Configuration();

        this.accountApi = new AccountApi(this.configuration);
        this.authApi = new AuthApi(this.configuration);
        this.vaultsApi = new VaultsApi(this.configuration);
    }
}

export const api = new VirkiAPI();