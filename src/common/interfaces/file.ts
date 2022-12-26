export interface EncryptedFile {
    file_encryption_header: string;
    mime_type: string;
    encryption_key: string;
    object_key: string;

    content?: Blob;
}

export enum FileType {
    Avatar = "avatar",
    VaultIcon = "vault_icon",
    TokenIcon = "token_icon"
}