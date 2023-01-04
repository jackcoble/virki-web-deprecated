import type { Plan } from "../enums/plans";

export interface Account {
    id: string;
    email: string;
    name: string;
    session_token: string;
    plan: Plan;
}