export interface Account {
    id: string;
    email: string;
    session_token: string;
    active_vault_id?: string;
}