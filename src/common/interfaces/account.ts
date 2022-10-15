import type { Plan } from "../enums/plans";

export interface Account {
    id: string;
    email: string;
    session_token: string;
    plan: Plan;
    active_vault_id?: string;
}