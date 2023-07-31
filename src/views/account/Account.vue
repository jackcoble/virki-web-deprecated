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
                <EncryptedFileUpload :encryption-key="encryptionKey" :placeholder="avatar" @object-key="handleAvatarUpload" />

                <ImageCropper :placeholder="avatar"></ImageCropper>
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
import { cryptoWorker } from '@/common/comlink';
import { useKeyStore } from '@/stores/keyStore';
import type { StretchedPassword } from '@/common/interfaces/password';
import useToaster from '@/composables/useToaster';
import EncryptedFileUpload from "@/components/EncryptedFileUpload.vue";
import VirkiStorageService from '@/common/services/storage';
import axios from 'axios';
import ImageCropper from '@/components/ImageCropper.vue';

export default defineComponent({
    name: "Sessions",
    components: {
    UserCircleIcon,
    CheckIcon,
    CameraIcon,
    EncryptedFileUpload,
    ImageCropper
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

        const encryptionKey = computed(() => keyStore.getMasterEncryptionKey);

        // Function to update user email via API
        const doUpdateEmail = async () => {
            updatingEmail.value = true;

            // Stretch the plaintext password into a hashed version
            const cryptoWorker = await new cryptoWorker();
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

        // When we receeive an object-key event (containing the object key from S3), we want to
        // fetch the file and decrypt it, then update the store with the blob URL.
        const handleAvatarUpload = async (key: any) => {
            // Update the user account information with the avatar object key
            try {
                await userService.UpdateAvatar(key);
            } catch (e) {
                // TODO: Handle...
                console.log(e);
                return toaster.error("Problem updating avatar!");
            }

            let res = await userService.GetFile(key);

            const avatarFile = res.data.file;
            const metadata = res.data.metadata;

            const storageService = new VirkiStorageService();
            const masterEncryptionKey = keyStore.getMasterEncryptionKey;

            // First, let us decrypt the encryption key with our master key
            const cryptoWorker = await new cryptoWorker();
            const encryptionKey = await cryptoWorker.decryptFromB64CipherString(metadata.encryption_key, masterEncryptionKey);

            // Decrypt the MIME type with the encryption key
            const mimeType = await cryptoWorker.decryptFromB64CipherStringToUTF8(metadata.mime_type, encryptionKey);

            // Fetch the contents of the file from directly from S3
            res = await axios.get(avatarFile.url, {
                responseType: "arraybuffer"
            });
            const file = res.data as ArrayBuffer;
            const uintFile = new Uint8Array(file);

            // Decrypt file into a blob for us to then store in IndexedDB
            const decryptedFile: Blob = await cryptoWorker.decryptFile(uintFile, mimeType, metadata.encryption_header, encryptionKey);
            await storageService.addAvatar(avatarFile.key, decryptedFile);

            const avatarFileObjectURL = URL.createObjectURL(decryptedFile);
            userStore.setAvatarURL(avatarFileObjectURL);
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

            encryptionKey,

            formatDate,
            doUpdateEmail,
            doUpdateName,
            handleAvatarUpload,
        }
    }
})
</script>