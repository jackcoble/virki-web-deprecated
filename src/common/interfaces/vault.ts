import type { DocType } from "../enums/database";

// Representation of a Vault
export interface Vault {
    _id: string;
    _rev?: string;
    doctype: DocType;
    encryption_key: string;
    name: string;
    icon?: string;
    createdAt: string;
    updatedAt: string;
}