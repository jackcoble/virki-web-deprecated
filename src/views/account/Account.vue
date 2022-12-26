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
                <EncryptedFileUpload :encryption-key="encryptionKey" :placeholder="avatar" :file-type="FileType.Avatar" />
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
import { FileType } from '@/common/interfaces/file';
import EncryptedFileUpload from "@/components/EncryptedFileUpload.vue";

export default defineComponent({
    name: "Sessions",
    components: {
        UserCircleIcon,
        CheckIcon,
        CameraIcon,

        EncryptedFileUpload
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

            encryptionKey,

            formatDate,
            doUpdateEmail,
            doUpdateName,

            FileType
        }
    }
})
</script>