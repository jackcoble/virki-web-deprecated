export enum PAGES {
    LOGIN = "/login",
    REGISTER = "/signup",
    LOCK = "/lock",

    // Vault management
    VAULT = "/vault",
    FAVOURITES = "/favourites",
    ADD_TOKEN = "/vault/:id/add-token",

    // Account management
    ACCOUNT = "/account",
    ACCOUNT_SESSIONS = "/account/sessions"
}