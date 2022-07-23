<template>
    <div class="flex items-center justify-center h-screen md:bg-gray-100">
        <div class="p-8 rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-2 sm:w-2/6 w-full">
            <!-- Header -->
            <LockClosedIcon class="h-24 text-purple-800 p-2 mx-auto" />
            <h1 class="text-lg text-center">Authoriser is locked. Verify your password to continue.</h1>

            <!-- Master password entry form -->
            <form @submit.prevent="unlockVault" class="space-y-2">
                <!-- Password -->
                <b-password-input v-model="password" placeholder="Master password" />

                <!-- User currently logged in -->
                <p class="text-sm text-center">
                    Currently signed in as
                    <span class="font-bold">{{ email }}</span>
                </p>

                <!-- Unlock and Logout buttons -->
                <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                    <b-button type="submit" classType="primary" :loading="isLoading">
                        <div class="flex flex-row justify-center">
                            <LockOpenIcon class="w-4 mr-1" />
                            Unlock
                        </div>
                    </b-button>

                    <b-button @click.prevent="logoutUser" classType="light">
                        <div class="flex flex-row justify-center">
                            <LogoutIcon class="w-4 mr-1" />
                            Log out
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
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { computed } from "@vue/reactivity";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { LockClosedIcon, LockOpenIcon, LogoutIcon } from "@heroicons/vue/outline";
import { useApplicationStore } from "@/stores/appStore";
import useAuthoriserDB from "@/composables/useAuthoriserDB";
import { Crypto } from "@/class/crypto";
import useAccount from "@/composables/useAccount";

export default defineComponent({
    name: "Lock",
    components: {
        LockOpenIcon,
        LockClosedIcon,
        LogoutIcon
    },
    setup() {
        const router = useRouter();
        const toaster = useToaster();

        const acc = useAccount();
        const applicationStore = useApplicationStore();
        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();
        const authoriserDB = useAuthoriserDB();

        const isOnline = computed(() => applicationStore.isOnline);
        const email = computed(() => authenticationStore.getEmail);

        const password = ref("");
        const isLoading = ref(false);

        // Function to unlock vault
        const unlockVault = async () => {
            isLoading.value = true;

            // Decrypting the master keypair private key and setting it our store.
            try {
                const activeAccount = authenticationStore.getActiveAccount;
                const account = await authoriserDB.getAccount(activeAccount!);

                // Stretch the password
                const extended = await acc?.deriveStretchedPassword(password.value, account.password.salt);

                const decryptedMasterPrivateKey = await Crypto.decrypt(account.encrypted_master_keypair.private_key, await Crypto.fromBase64(extended.key));
                encryptionKeyStore.setMasterKeyPair(await Crypto.toBase64(decryptedMasterPrivateKey), account.encrypted_master_keypair.public_key);
            } catch (e) {
                isLoading.value = false;

                toaster.error(e);
                return;
            }

            // After decryption, request new access and refresh tokens from API (if device is online)
            if (!!isOnline.value) {
                try {
                    const accessToken = authenticationStore.getAccessToken;
                    const refreshToken = authenticationStore.getRefreshToken;

                    const res = await authentication.RefreshTokens(accessToken!, refreshToken!);
                    if (res.data) {
                        authenticationStore.setAccessToken(res.data.access_token);
                        authenticationStore.setRefreshToken(res.data.refresh_token);
                    }
                } catch (e) {
                    isLoading.value = false;

                    toaster.error(e.response.data.error);
                    return;
                }
            }

            isLoading.value = false;

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
            isLoading,

            unlockVault,
            logoutUser
        }
    }
})
</script>