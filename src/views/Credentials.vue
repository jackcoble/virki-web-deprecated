<template>
    <div class="flex justify-center items-center h-screen bg-mine-shaft p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <div space-y-1>
                <h1 class="text-xl text-center">Welcome back, <span class="text-mountain-meadow">{{ email }}</span>.</h1>
                <p class="text-xs text-center">Please enter your password to decrypt your account.</p>
            </div>

            <form @submit.prevent="handleDecryption" class="space-y-2">
                <!-- Password input -->
                <p class="font-bold text-sm">Password</p>
                <b-password-input v-model="password" autofocus />

                <!-- Unlock button -->
                <div class="flex flex-wrap md:flex-nowrap justify-center items-center md:space-x-2 space-y-2 md:space-y-0 pt-3">
                    <b-button type="submit" classType="primary" :disabled="isLoading" disabledText="Decrypting keys..." :loading="isLoading">
                        <div class="flex flex-row justify-center items-center">
                            <LoginIcon class="w-4 mr-1" />
                            <span>Submit</span>
                        </div>
                    </b-button>
                </div>
            </form>

            <div class="flex justify-center items-center space-x-1 pt-3">
                <img src="@/assets/gb_flag.svg" class="w-5 rounded-sm" alt="GB Flag">
                <p class="text-xs">Made in the UK.</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import useToaster from "@/composables/useToaster";

import { ClockIcon, LoginIcon, UserAddIcon } from "@heroicons/vue/outline";
import { getData, LS_KEYS } from "@/utils/storage/localStorage";
import type { Keys } from "@/types/user";
import { getDedicatedCryptoWorker } from "@/utils/comlink";

export default defineComponent({
    name: "Login",
    components: {
        ClockIcon,
        LoginIcon,
        UserAddIcon
    },
    setup() {
        const email = ref("");
        const password = ref("");
        const isLoading = ref(false);

        const router = useRouter();
        const toaster = useToaster();

        // Load user data from LocalStorage
        onMounted(() => {
            const userData = getData(LS_KEYS.USER_DETAILS);
            email.value = userData.email;
        })

        // Handle decryption
        const handleDecryption = async () => {
            isLoading.value = true;

            // Fetch encryption keys from LocalStorage
            // and decrypt them with the CryptoWorker.
            const encryptedKeys: Keys = getData(LS_KEYS.KEYS);
            const cryptoWorker = getDedicatedCryptoWorker();
            
            // Decrypt keys
            try {
                const keys = await cryptoWorker.decryptKeys(password.value, encryptedKeys);
                console.log(keys);
            } catch (e) {
                console.log("Error decrypting:", e);
            } finally {
                isLoading.value = false;
            }
        }

        return {
            email,
            password,
            isLoading,

            router,

            handleDecryption
        }
    }
})
</script>