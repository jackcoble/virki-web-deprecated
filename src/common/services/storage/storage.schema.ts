import type { RxJsonSchema, RxSchema } from "rxdb";

// Vault storage schema
export const VaultSchema: RxJsonSchema<any> = {
    "title": "Vaults",
    "version": 0,
    "description": "Offline storage for Virki vaults",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 36 // <- the primary key must have set maxLength (in this case its 36 chars - UUIDv4 specification)
        },
    }
}
