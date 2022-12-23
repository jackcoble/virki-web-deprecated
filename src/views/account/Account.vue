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
                <div class="flex items-center justify-center p-2 bg-gray-50 border border-gray-300 rounded-full w-36 h-36">
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
                <b-input type="email" v-model="email" placeholder="hello@virki.io" autofocus />

                <!-- Master password -->
                <p class="font-bold text-sm">Master Password</p>
                <b-password-input v-model="password"></b-password-input>
                <p class="text-xs text-gray-600">We need your master password to verify the email update request.</p>

                <b-button class="md:w-1/3 w-full" :disabled="emailChanged" @click="doUpdateEmail">Update</b-button>
            </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import userService from '@/service/api/userService';
import { defineComponent, ref } from 'vue';
import { fromUnixTime, formatRelative, subDays } from "date-fns";
import { computed } from '@vue/reactivity';
import { useUserStore } from '@/stores/userStore';
import { UserCircleIcon, CheckIcon, CameraIcon } from "@heroicons/vue/solid"
import axios from 'axios';
import { CryptoWorker } from '@/common/comlink';
import { useKeyStore } from '@/stores/keyStore';
import type { StretchedPassword } from '@/common/interfaces/password';
import useToaster from '@/composables/useToaster';

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

        const email = computed(() => userStore.getEmail);
        const password = ref("");
        const emailChanged = computed(() => email.value === userStore.getEmail);

        // Return a relative human readable date
        const formatDate = (unix: any) => {
            const formatted = formatRelative(subDays(fromUnixTime(unix), 0), new Date())
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }

        // Function to update user email via API
        const doUpdateEmail = async () => {
            // Stretch the plaintext password into a hashed version
            const cryptoWorker = await new CryptoWorker();
            const encryptedKeys = keyStore.getEncryptedKeys;
            const stretchedPassword: StretchedPassword = await cryptoWorker.stretchPassword(password.value, encryptedKeys.kek.salt, encryptedKeys.kek.ops_limit, encryptedKeys.kek.mem_limit);

            try {
                await userService.UpdateEmail(email.value, stretchedPassword.hash);
            } catch (e) {
                return toaster.error(e.response.data.error);
            }

            // Update the email in the store
            const account = {...userStore.account};
            account.email = email.value;
            userStore.setAccount(account);

            // Success!
            toaster.success("Email address was updated!");
        }

        // Handle avatar uploads
        const avatarImage = ref()
        const uploadImage = async (event: any) => {
            try {
                // Extract the file from the upload input
                const file = event.target.files[0];
                let fileContents: ArrayBuffer;

                const reader = new FileReader();
                reader.readAsArrayBuffer(file);

                // Wait for file to be read
                await new Promise((resolve) => {
                    reader.onload = resolve;
                });
                fileContents = reader.result as ArrayBuffer;

                const uIntFileContents = new Uint8Array(fileContents);

                // Encrypt
                const cryptoWorker = await new CryptoWorker();
                const eFile = await cryptoWorker.encryptFile("test.jpeg", "image/jpeg", uIntFileContents);

                // Request for a presigned URL
                let res = await userService.UploadAvatar();
                const url = res.data.url as string;

                // Upload the avatar content directly to B2, and the metadata to our API
                await axios.put(url, eFile.content, { headers: { "Content-Type": "application/octet-stream" } })
            } catch (e) {
                // TODO: Handle this...
                console.log(e);
            }
        }

        return {
            email,
            password,
            emailChanged,

            avatarImage,

            formatDate,
            uploadImage,
            doUpdateEmail
        }
    }
})
</script>