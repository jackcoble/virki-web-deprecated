<template>
    <div class="flex flex-col p-6 pt-12 space-y-2">
        <div class="px-4 sm:px-6 lg:px-8 space-y-4">
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">
                        My Account
                    </h1>
                    <p class="mt-2 text-sm text-gray-700">A brief overview of your
                        <span class="text-mountain-meadow">Virki</span> account.
                    </p>
                </div>
            </div>

            <hr>

            <div class="flex items-center md:justify-start justify-between space-x-10">
                <!-- Name  -->
                <div class="md:w-1/3 w-full space-y-2">
                    <!-- Name -->
                    <div class="space-y-1">
                        <p class="font-bold text-sm">Name</p>
                        <b-input type="text" v-model="name"/>
                    </div>

                    <!-- Save button -->
                    <b-button class="md:w-1/3 w-full" @click="doUpdateName">
                        <div class="flex flex-row justify-center items-center">
                            <CheckIcon class="w-4 mr-1" />
                            <span>Save</span>
                        </div>
                    </b-button>
                </div>

                <!-- Avatar -->
                <div class="flex items-center justify-center bg-gray-50 rounded-full md:w-28 w-20 cursor-pointer border-4 border-gray-300" @click="triggerAvatarInput">
                    <input class="hidden" type="file" accept="image/*" @change="handleAvatarChange" ref="avatarInput" />
                    <CameraIcon v-if="!avatar" class="text-gray-400 w-12 h-12" />
                    <img v-else class="object-scale-down rounded-full" :src="avatar" alt="Avatar">
                </div>
            </div>

            <hr>

            <!-- Change email address -->
            <div class="space-y-4">
                <h1 class="text-xl font-semibold text-gray-900">
                    Change Email Address
                </h1>

                <div class="md:w-1/4 w-full space-y-2">
                    <!-- Email -->
                    <p class="font-bold text-sm">Email Address</p>
                    <b-input type="email" v-model="email" placeholder="hello@virki.io" />

                    <!-- Master password -->
                    <p class="font-bold text-sm">Master Password</p>
                    <b-password-input v-model="password"></b-password-input>
                    <p class="text-xs text-gray-600">We need your master password to verify the email update request.
                    </p>

                    <b-button class="md:w-1/3 w-full" :disabled="emailChanged" @click="doUpdateEmail"
                        :loading="updatingEmail">
                        <div class="flex flex-row justify-center items-center">
                            <CheckIcon class="w-4 mr-1" />
                            <span>Save</span>
                        </div>
                    </b-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import userService from '@/service/api/userService';
import { defineComponent, ref, computed } from 'vue';
import { fromUnixTime, formatRelative, subDays } from "date-fns";
import { useUserStore } from '@/stores/userStore';
import { UserCircleIcon, CheckIcon, CameraIcon } from "@heroicons/vue/solid"
import { CryptoWorker } from '@/common/comlink';
import { useKeyStore } from '@/stores/keyStore';
import type { StretchedPassword } from '@/common/interfaces/password';
import useToaster from '@/composables/useToaster';
import type { EncryptedFile } from '@/common/interfaces/file';
import { encrypt } from '@/common/utils/sodium';
import { serialiseCipherString } from '@/common/utils/cipher';
import { EncryptionType } from '@/common/enums/encryptionType';
import type { EncryptionResult } from '@/common/interfaces/encryption';
import axios from 'axios';
import { VirkiStorageService } from '@/common/services/storage.service';

export default defineComponent({
    name: "Sessions",
    components: {
        UserCircleIcon,
        CheckIcon,
        CameraIcon
    },
    setup() {
        const userStore = useUserStore();
        const keyStore = useKeyStore();
        const toaster = useToaster();

        const email = ref(userStore.getEmail);
        const name = ref(userStore.getName);
        const avatar = computed(() => userStore.getAvatarURL);
        const password = ref("");
        const emailChanged = computed(() => email.value === userStore.getEmail);
        const updatingEmail = ref(false);

        // Function to handle triggering input, uploading encrypted file to API and S3
        const avatarInput = ref();
        const triggerAvatarInput = () => {
            if(avatarInput.value) {
                avatarInput.value.click();
            }
        }

        const handleAvatarChange = async (event: any) => {
            // Need to extract the File from the input event.
            // Also prepare converting the file contents to ArrayBuffer
            const file = event.target.files[0];
            let fileContents: ArrayBuffer;

            // Read in the file
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            await new Promise((resolve) => {
                reader.onload = resolve;
            })
            fileContents = reader.result as ArrayBuffer;

            // File contents need to be represented as Uint8Array before encryption...
            const uIntFileContents = new Uint8Array(fileContents);

            // Fetch an upload URL
            let presignedUrl: any;
            await userService.GetUploadURLs().then(res => {
                presignedUrl = res.data[0];
            })

            // We need to encrypt the avatar now
            const cryptoWorker = await new CryptoWorker();
            const encryptedFile: EncryptedFile = await cryptoWorker.encryptFile(file.type, uIntFileContents, presignedUrl.key);

            // As the encrypted file has been encrypted with a standalone encryption key,
            // we need to encrypt it with our master key.
            const masterEncryptionKey = keyStore.getMasterEncryptionKey;
            const encryptedFileKey: EncryptionResult = await cryptoWorker.encryptToB64(encryptedFile.encryption_key, masterEncryptionKey);
            const encryptedFileKeyCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedFileKey.ciphertext, encryptedFileKey.nonce, encryptedFileKey.mac);
            encryptedFile.encryption_key = encryptedFileKeyCipherString;

            // Everything is encrypted now, so we can send the metadata to our API, and the encrypted contents up to S3.
            // We should have content in our encrypted file
            if (!encryptedFile.content) {
                return;
            }

            // Send to API
            await userService.UploadAvatar(encryptedFile);

            // Send to S3
            await axios.put(
                presignedUrl.url,
                encryptedFile.content,
                {
                    headers: {
                        "Content-Type": encryptedFile.content.type // Should be "application/octet-stream"
                    }
                }
            )

            // We should get rid of this at some point, but for now to make sure the user avatar is the most recent.
            // Fetch and decrypt it.
            await userService.GetAvatar().then(async res => {
                const avatarFile = res.data.file;
                const metadata = res.data.metadata;

                // First, let us decrypt the encryption key with our master key
                const encryptionKey = await cryptoWorker.decryptFromB64CipherString(metadata.encryption_key, masterEncryptionKey);

                // Decrypt the MIME type with the encryption key
                const mimeType = await cryptoWorker.decryptFromB64CipherStringToUTF8(metadata.mime_type, encryptionKey);

                // Fetch the contents of the file from S3 and convert to a Uint8Arrau
                res = await axios.get(avatarFile.url, {
                    responseType: "arraybuffer"
                });
                const file = res.data as ArrayBuffer;
                const uintFile = new Uint8Array(file);

                // Decrypt file into a blob for us to then store in IndexedDB (via Virki Storage Service)
                const storageService = new VirkiStorageService();
                const decryptedFile: Blob = await cryptoWorker.decryptFile(uintFile, mimeType, metadata.encryption_header, encryptionKey);
                await storageService.addAvatar(decryptedFile);

                // Retrieve the avatar from IndexedDB and create an object URL
                const decryptedAvatarFile = await storageService.getAvatar();
                if (!decryptedAvatarFile) {
                    return;
                } 

                const avatarUrl = URL.createObjectURL(decryptedAvatarFile);
                userStore.setAvatarURL(avatarUrl);
            })
        }

        // Function to update user email via API
        const doUpdateEmail = async () => {
            updatingEmail.value = true;

            // Stretch the plaintext password into a hashed version
            const cryptoWorker = await new CryptoWorker();
            const encryptedKeys = keyStore.getEncryptedKeys;
            const stretchedPassword: StretchedPassword = await cryptoWorker.stretchPassword(password.value, encryptedKeys.kek.salt, encryptedKeys.kek.ops_limit, encryptedKeys.kek.mem_limit);

            try {
                await userService.UpdateEmail(email.value, stretchedPassword.hash);
            } catch (e) {
                return toaster.error(e.response.data.error);
            } finally {
                updatingEmail.value = false;
            }

            // Update the email in the store
            const account = { ...userStore.account };
            account.email = email.value;
            userStore.setAccount(account);

            // Success!
            toaster.success("Email address was updated!");
        }

        // Function to update users name via API
        const doUpdateName = async () => {
            try {
                await userService.UpdateName(name.value);
            } catch (e) {
                return toaster.error(e.response.data.error);
            }

            // Update the name in the store
            const account = { ...userStore.account };
            account.name = name.value;
            userStore.setAccount(account);

            // Success!
            toaster.success("Name was updated!");
        }

        // Return a relative human readable date
        const formatDate = (unix: any) => {
            const formatted = formatRelative(subDays(fromUnixTime(unix), 0), new Date())
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }

        return {
            email,
            name,
            password,
            avatar,
            emailChanged,
            updatingEmail,

            avatarInput,
            handleAvatarChange,
            triggerAvatarInput,

            formatDate,
            doUpdateEmail,
            doUpdateName
        }
    }
})
</script>