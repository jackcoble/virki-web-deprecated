<template>
    <div class="flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 transition cursor-pointer w-24 h-24" @click="triggerUploadInput">
        <input class="hidden" type="file" accept="image/*" ref="uploadInput" @change="handleInputChange" />
        <UploadIcon v-if="!uploadedFile && !placeholder" class="text-gray-400 w-10 h-10 p-2" />
        <img v-else class="rounded-full w-24 h-24 object-scale-down" :src="uploadedFile || placeholder" alt="Image" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { UploadIcon } from '@heroicons/vue/solid';
import userService from '@/service/api/userService';
import { CryptoWorker } from '@/common/comlink';
import type { EncryptedFile } from '@/common/interfaces/file';
import { EncryptionType } from '@/common/enums/encryptionType';
import type { EncryptionResult } from '@/common/interfaces/encryption';
import { serialiseCipherString } from '@/common/utils/cipher';
import axios from 'axios';

export default defineComponent({
    name: "EncryptedFileUpload",
    props: {
        encryptionKey: {
            type: String,
            required: true
        },
        placeholder: {
            type: String
        }
    },
    emits: ['objectKey', 'error'],
    components: {
        UploadIcon
    },
    setup(props, { emit }) {
        const uploadInput = ref();
        const uploadedFile = ref("");

        // Triggers the input element by clicking it
        const triggerUploadInput = () => {
            if (uploadInput.value) {
                uploadInput.value.click();
            }
        }

        // When we receive a change event from the input element, we want to go through the encryption process
        const handleInputChange = async (event: any) => {
            // Extract the file from the event. If no file is present
            // then emit an error event.
            const file: File = event.target.files[0];
            if (!file) {
                emit("error", "No file was uploaded.")
                return;
            }

            // Read in the raw contents of the file to an ArrayBuffer, and then convert into Uint8Array before encryption.
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            await new Promise((resolve) => {
                reader.onload = resolve;
            });
            const fileArrayBuffer = reader.result as ArrayBuffer;
            const fileContents = new Uint8Array(fileArrayBuffer);

            // We have the raw file contents now, and by this point, it is safe to assume the
            // user wants to upload to S3. Let's fetch a pre-signed URL and keep it for later.
            let presignedURL: any;
            try {
                const res = await userService.GetUploadURLs();
                presignedURL = res.data[0]; // Only requested for 1 URL, so it'll be the first item in the array
            } catch (e: any) {
                // TODO: Handle this better...
                emit("error", "Error fetching pre-signed URL for file upload.");
                return;
            }

            // We can then encrypt the file.
            const cryptoWorker = await new CryptoWorker();
            const encryptedFile: EncryptedFile = await cryptoWorker.encryptFile(file.type, fileContents, presignedURL.key);

            // The "key" property we get back in the encrypted file object isn't encrypted. So we need to encrypt that key with our "master encryption key" before
            // we even consider uploading.
            const encryptedFileKey: EncryptionResult = await cryptoWorker.encryptToB64(encryptedFile.encryption_key, props.encryptionKey);
            const encryptedFileKeyCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedFileKey.ciphertext, encryptedFileKey.nonce, encryptedFileKey.mac);
            encryptedFile.encryption_key = encryptedFileKeyCipherString;

            // Everything is encrypted now. We can begin uploading the metadata to our API, and then the encrypted file contents to S3 via the presigned URL.
            // Send metadata to API
            try {
                await userService.UploadFile(encryptedFile);
            } catch (e: any) {
                // TODO: Handle this better
                emit("error", "Error uploading file metadata to API.")
                return;
            }

            // Send encrypted contents to S3
            try {
                await axios.put(
                    presignedURL.url,
                    encryptedFile.content,
                    {
                        headers: {
                            "Content-Type": 'application/octet-stream' // Always will be application/octet-stream
                        }
                    }
                )
            } catch (e: any) {
                // TODO: Handle this better
                emit("error", "Error uploading file contents to object storage.")
                return;
            }

            // Set the uploaded file value and emit the object key
            uploadedFile.value = URL.createObjectURL(file);
            emit("objectKey", presignedURL.key);
        }

        return {
            uploadInput,
            uploadedFile,

            triggerUploadInput,
            handleInputChange
        }
    }
})
</script>