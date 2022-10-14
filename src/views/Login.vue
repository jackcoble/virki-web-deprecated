<template>
    <div class="flex justify-center items-center h-screen bg-gray-100 p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <div space-y-1>
                <h1 class="text-xl text-center">Welcome to <span class="text-mountain-meadow">Virki</span>.</h1>
                <p class="text-xs text-center">Your secure two-factor authentication vault.</p>
            </div>

            <form @submit.prevent="handleSignIn" class="space-y-2">
                <!-- Email input -->
                <p class="font-bold text-sm">Email Address</p>
                <b-input type="email" v-model="email" placeholder="hello@virki.io" autofocus />

                <!-- Password input -->
                <p class="font-bold text-sm">Password</p>
                <b-password-input v-model="password" placeholder="Master password" />

                <!-- Cloudflare Turnstile -->
                <CloudflareTurnstile site-key="0x4AAAAAAAAp_uCeOoj1R-By" @success="turnstileToken = $event" />

                <!-- Login and Create buttons -->
                <div class="flex flex-wrap md:flex-nowrap justify-center items-center md:space-x-2 space-y-2 md:space-y-0 pt-3">
                    <b-button type="submit" classType="primary" :loading="isLoading">
                        <div class="flex flex-row justify-center items-center">
                            <LoginIcon class="w-4 mr-1" />
                            <span>Log In</span>
                        </div>
                    </b-button>

                    <b-button classType="light" @click="router.push('/signup')">
                        <div class="flex flex-row justify-center items-center">
                            <UserAddIcon class="w-4 mr-1" />
                            <span>Create Account</span>
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
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import CloudflareTurnstile from "@/components/CloudflareTurnstile.vue";

import useToaster from "@/composables/useToaster";
import userService from "@/service/api/userService";

import { ClockIcon, LoginIcon, UserAddIcon } from "@heroicons/vue/outline";
import { useUserStore } from "@/stores/userStore";
import type { StretchedPassword } from "@/common/interfaces/password";
import { CryptoWorker } from "@/utils/comlink";
import { parseCipherString } from "@/common/utils/cipher";
import { useKeyStore } from "@/stores/keyStore";
import { PAGES } from "@/router/pages";
import type { Account } from "@/common/interfaces/account";

export default defineComponent({
    name: "Login",
    components: {
        ClockIcon,
        LoginIcon,
        UserAddIcon,
        CloudflareTurnstile
    },
    setup() {
        const email = ref("");
        const password = ref("");
        const turnstileToken = ref("")
        const isLoading = ref(false);

        const router = useRouter();
        const toaster = useToaster();
        
        const keyStore = useKeyStore()
        const userStore = useUserStore();

        // Handle user login
        const handleSignIn = async () => {
            isLoading.value = true;

            // Using the email address, request the prelogin (password salt), and stretch the password
            try {
                let res = await userService.PreLogin(email.value);
                const argon = {
                    salt: res.data.salt,
                    opsLimit: res.data.ops_limit,
                    memLimit: res.data.mem_limit
                } as StretchedPassword;

                // Stretch password
                const cryptoWorker = await new CryptoWorker();
                const stretchedPassword: StretchedPassword = await cryptoWorker.stretchPassword(password.value, argon.salt, argon.opsLimit, argon.memLimit);
                
                // Request for the encrypted key material
                res = await userService.Login(email.value, stretchedPassword.hash, turnstileToken.value);
                const encryptedMasterKey = res.data.encrypted_keys.master_encryption_key;

                // Set account details
                const accountDetails: Account = {
                    id: res.data.user_id,
                    email: res.data.email,
                    session_token: res.data.session_token
                }
                userStore.setAccount(accountDetails);

                // Parse cipher string for master encryption key
                const encryptionKeyCipher = await parseCipherString(encryptedMasterKey);
                const encryptionKey = await cryptoWorker.decryptFromB64(encryptionKeyCipher.ciphertext, encryptionKeyCipher.mac, encryptionKeyCipher.nonce, stretchedPassword.key);

                keyStore.setEncryptedKeys(res.data.encrypted_keys);
                keyStore.setMasterEncryptionKey(encryptionKey);

                router.push(PAGES.VAULT);
            } catch (e) {
                if (e.response.data && e.response.data.error) {
                    toaster.error(e.response.data.error);
                    return;
                } else {
                    toaster.error("An unknown error has occurred.");
                    return;
                }
            } finally {
                isLoading.value = false;
            }
        }

        return {
            email,
            password,
            turnstileToken,
            isLoading,

            router,

            handleSignIn
        }
    }
})
</script>