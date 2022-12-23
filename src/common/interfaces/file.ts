export interface EncryptedFile {
    file_name: string;
    file_encryption_header: string;
    mime_type: string;
    encryption_key: string;
    object_key: string;

    content?: Blob;
}