<template>
    <div class="flex justify-center items-center h-screen bg-gray-100">
        <div class="p-8 rounded shadow-sm bg-white border border-gray-200 space-y-3 sm:w-2/6 w-full">
            <!-- Header -->
            <ClockIcon class="h-24 text-purple-800 p-2 mx-auto" />
            <h1 class="text-lg text-center">Log in or create an Authoriser account.</h1>

            <form @submit.prevent="handleSignIn" class="space-y-2">
                <!-- Email input -->
                <p class="font-bold text-sm">Email Address</p>
                <b-input type="email" v-model="email" autofocus />

                <!-- Master password -->
                <p class="font-bold text-sm pt-2">Master Password</p>
                <b-password-input v-model="password" />

                <!-- Unlock and Logout buttons -->
                <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                    <b-button type="submit" classType="primary" :loading="isLoading">
                        <div class="flex flex-row justify-center">
                            <LoginIcon class="w-4 mr-1" />
                            Log In
                        </div>
                    </b-button>

                    <b-button classType="light" @click="router.push('/signup')">
                        <div class="flex flex-row justify-center">
                            <UserAddIcon class="w-4 mr-1" />
                            Create Account
                        </div>
                    </b-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { Account } from "@/class/account";
import useToaster from "@/composables/useToaster";
import authentication from "@/service/api/authentication";
import user from "@/service/api/user";
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { ClockIcon, LoginIcon, UserAddIcon } from "@heroicons/vue/outline";

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
        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();
        const toaster = useToaster();
        const account = new Account();

        // Handle user login
        const handleSignIn = async () => {
            isLoading.value = true;

            // Using the email address, request carry out a pre-login check for salt.
            // If we can, extend the password using it
            try {
                let salt;
                let res = await authentication.PreLogin(email.value);
                salt = res.data.password_salt;

                const extendedKeyHash = await account.deriveHashedStretchedPassword(password.value, salt);

                // Attempt to login and set access/refresh tokens in store
                res = await authentication.Login(email.value, extendedKeyHash);
                if (res.data && res.data.access_token && res.data.refresh_token) {
                    authenticationStore.setEmail(email.value);
                    authenticationStore.setPasswordSalt(salt);
                    authenticationStore.setAccessToken(res.data.access_token);
                    authenticationStore.setRefreshToken(res.data.refresh_token);
                }
            } catch (e) {
                isLoading.value = false;

                if (e.response.data && e.response.data.error) {
                    toaster.error(e.response.data.error);
                    return;
                } else {
                    toaster.error("An unknown error has occurred.");
                    return;
                }
            }

            // Now onto the actual authentication request
            try {
                // Fetch encrypted user account and decrypt it
                const res = await user.GetAccount();
                if (res.data) {
                    const masterKey = await account.decryptMasterKey(password.value, res.data.password.salt, res.data.encrypted_master_key);

                    // Set some things in the encryption key store
                    encryptionKeyStore.setMasterKey(masterKey);
                    encryptionKeyStore.setEncryptedMasterKey(res.data.encrypted_master_key);
                }

                // Push to Index
                router.push("/");
            } catch (e) {
                toaster.error(e);
                return;
            } finally {
                isLoading.value = false;
            }
        }

        return {
            email,
            password,
            isLoading,

            router,

            handleSignIn
        }
    }
})
</script>