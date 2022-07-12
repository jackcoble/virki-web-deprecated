<template>
    <div class="flex justify-center items-center h-screen">
        <form @submit.prevent="handleSignIn">
            <div class="mb-6">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email
                    address</label>
                <input type="email" id="email"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Email address" v-model="email" required autofocus>
            </div>
            <div class="mb-6">
                <label for="password"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Password</label>
                <input type="password" id="password" placeholder="●●●●●●●●●●●●●●"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required v-model="password">
            </div>
            <div class="flex items-start mb-6">
                <div class="flex items-center h-5">
                    <input id="remember" type="checkbox" value=""
                        class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800">
                </div>
                <label for="remember" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Remember
                    email</label>
            </div>
            <button type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
        </form>
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

export default defineComponent({
    name: "Login",
    setup() {
        const email = ref("");
        const password = ref("");

        const router = useRouter();
        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();
        const toaster = useToaster();
        const account = new Account();

        // Handle user login
        const handleSignIn = async () => {
            // Using the email address, request carry out a pre-login check for salt.
            // If we can, extend the password using it
            try {
                let res = await authentication.PreLogin(email.value);
                const saltBuffer = Buffer.from(res.data.password_salt, "base64");
                const extended = await account.deriveStretchedPassword(password.value, saltBuffer);
                
                // Using the extended key we can generate a SHA-256 hash of it to send to the login endpoint.
                const stretchedKeyBytes = new TextEncoder().encode(extended.key);
                const stretchedKeyHashBytes = await window.crypto.subtle.digest("SHA-256", stretchedKeyBytes);
                const stretchedKeyHashEncoded = Buffer.from(stretchedKeyHashBytes).toString("base64");

                // Attempt to login and set access/refresh tokens in store
                res = await authentication.Login(email.value, stretchedKeyHashEncoded);
                if (res.data && res.data.access_token && res.data.refresh_token) {
                    authenticationStore.setAccessToken(res.data.access_token);
                    authenticationStore.setRefreshToken(res.data.refresh_token);
                }

                // Fetch encrypted user account and decrypt it
                res = await user.GetAccount();
                if (res.data) {
                    const masterKey = await account.decryptMasterKey(password.value, res.data.password.salt, res.data.encrypted_master_key);
                    encryptionKeyStore.setMasterKey(masterKey);
                }

                // Push to Index
                router.push("/");
            } catch (e) {
                if (e.response.data && e.response.data.error) {
                    toaster.error(e.response.data.error);
                } else {
                    toaster.error("An unknown error has occurred.")
                }
                
            }
        }

        return {
            email,
            password,

            handleSignIn
        }
    }
})
</script>