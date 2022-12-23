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

            <div class="flex items-center space-x-10 p-2">
                <!-- Name  -->
                <div class="w-1/3 space-y-2">
                    <!-- Name -->
                    <div class="space-y-1">
                        <p class="font-bold text-sm">Name</p>
                        <b-input type="email" placeholder="John Doe" />
                    </div>

                    <!-- Save button -->
                    <b-button class="md:w-1/3 w-full">
                        <div class="flex flex-row justify-center items-center">
                            <CheckIcon class="w-4 mr-1" />
                            <span>Save</span>
                        </div>
                    </b-button>
                </div>

                <!-- Avatar -->
                <div class="flex items-center justify-center p-2 bg-gray-50 border border-gray-300 rounded-full w-36 h-36 cursor-pointer" @click="triggerAvatarInput">
                    <input class="hidden" type="file" accept="image/*" @change="handleAvatarChange" ref="avatarInput" />
                    <CameraIcon class="text-gray-400 w-12 h-12" />
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
            const encryptedFile: EncryptedFile = await cryptoWorker.encryptFile(file.name, file.type, uIntFileContents, presignedUrl.key);

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

        // Return a relative human readable date
        const formatDate = (unix: any) => {
            const formatted = formatRelative(subDays(fromUnixTime(unix), 0), new Date())
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }

        return {
            email,
            password,
            emailChanged,
            updatingEmail,

            avatarInput,
            handleAvatarChange,
            triggerAvatarInput,

            formatDate,
            doUpdateEmail
        }
    }
})
</script>