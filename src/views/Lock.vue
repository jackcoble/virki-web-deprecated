<template>
    <div class="flex items-center justify-center p-8 h-screen">
        <div class="p-8 rounded bg-gray-50 border border-gray-200 space-y-2">
            <!-- Header -->
            <LockClosedIcon class="h-24 text-gray-700 p-2 mx-auto" />
            <h1 class="text-lg text-center">Authoriser is locked. Verify your password to continue.</h1>

            <!-- Password -->
            <input type="password" placeholder="Master password" v-model="password"
                class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">

            <!-- User currently logged in -->
            <p class="text-sm">
                Currently signed in as
                <span class="font-bold">{{ email }}</span>
            </p>

            <!-- Unlock and Logout buttons -->
            <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                <button @click.prevent="unlockVault" type="button"
                    class="w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-400 focus:outline-none sm:text-sm">
                    Unlock
                </button>

                <button @click.prevent="logoutUser" type="button"
                    class="w-full rounded-md border shadow-sm px-4 py-2 text-base font-medium text-gray-900 focus:outline-none sm:text-sm">
                    Logout
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Account } from "@/class/account";
import useToaster from "@/composables/useToaster";
import authentication from "@/service/api/authentication";
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { computed } from "@vue/reactivity";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { LockClosedIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "Lock",
    components: {
        LockClosedIcon
    },
    setup() {
        const router = useRouter();
        const toaster = useToaster();
        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();

        const email = computed(() => authenticationStore.getEmail);
        const password = ref("");

        const account = new Account();

        // Function to unlock vault
        const unlockVault = async () => {
            // Decrypting the master key and then setting it in memory again
            try {
                const salt = authenticationStore.getPasswordSalt;
                const encryptedMasterKey = encryptionKeyStore.getEncryptedMasterKey;
                if (salt && encryptedMasterKey) {
                    const masterKey = await account.decryptMasterKey(password.value, salt, encryptedMasterKey)
                    encryptionKeyStore.setMasterKey(masterKey);
                }
            } catch (e) {
                toaster.error(e);
                return;
            }

            // After decryption, request new access and refresh tokens from API
            try {
                const accessToken = authenticationStore.getAccessToken;
                const refreshToken = authenticationStore.getRefreshToken;

                const res = await authentication.RefreshTokens(accessToken!, refreshToken!);
                if (res.data) {
                    authenticationStore.setAccessToken(res.data.access_token);
                    authenticationStore.setRefreshToken(res.data.refresh_token);
                }
            } catch (e) {
                toaster.error(e.response.data.error);
                return;
            }

            // Push to index
            router.push("/")
        }

        // Function to log out user
        const logoutUser = () => {
            // Clear all stores
            authenticationStore.clear();
            encryptionKeyStore.clear();

            // Push to login
            router.push("/login");
        }

        return {
            email,
            password,

            unlockVault,
            logoutUser
        }
    }
})
</script>