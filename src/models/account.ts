// Expected payload for when registering a new user account
interface IRegisterAccount {
    email: string;
    name: string;
    password: {
        hash: string;
        salt: string;
        hint: string;
    }
    encrypted_master_key: string;
}

export type {
    IRegisterAccount
}