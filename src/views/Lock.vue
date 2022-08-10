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
                    <span class="font-bold">{{ user.name }}.</span>
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
import useToaster from "@/composables/useToaster";
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { computed } from "@vue/reactivity";
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LockClosedIcon, LockOpenIcon, LogoutIcon } from "@heroicons/vue/outline";
import { useApplicationStore } from "@/stores/appStore";
import { Account } from "@/class/account";
import { Crypto } from "@/class/crypto";
import authentication from "@/service/api/authentication";

export default defineComponent({
    name: "Lock",
    components: {
        LockOpenIcon,
        LockClosedIcon,
        LogoutIcon
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const toaster = useToaster();

        const applicationStore = useApplicationStore();
        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();

        const isOnline = computed(() => applicationStore.isOnline);
  
        const user = computed(() => authenticationStore.getUser);
        const password = ref("");
        const isLoading = ref(false);

        // Function to unlock vault
        const unlockVault = async () => {
            isLoading.value = true;

            const account = new Account("", "");

            // We should have the password and encrypted master keypair stored on the device if we're here,
            // so using that information we can derive and decrypt it!
            const passwordData = authenticationStore.getPassword;
            const encryptedMasterKeypair = encryptionKeyStore.getEncryptedMasterKey;
            if (passwordData && encryptedMasterKeypair) {
                // Using password information, we need to derive the stretched password
                const stretchedPassword = await account.deriveStretchedPassword(password.value, passwordData.salt);

                // Decrypt the encrypted master keypair and store in memory
                try {
                    const decryptedMasterPrivateKey = await Crypto.decrypt(encryptedMasterKeypair.private_key, await Crypto.fromBase64(stretchedPassword.key));
                    encryptionKeyStore.setMasterKeyPair(await Crypto.toBase64(decryptedMasterPrivateKey), encryptedMasterKeypair.public_key);
                } catch (e) {
                    isLoading.value = false;
                    return toaster.error("There was an error decrypting your private key, please try again!");
                }
            }

            // If this device is online, we can request for some updated access/refresh tokens.
            if (!!isOnline.value) {
                try {
                    const existingTokens = authenticationStore.getTokens;
                    const res = await authentication.RefreshTokens(existingTokens.access_token, existingTokens.refresh_token);

                    // Update authentication store
                    if (res && res.data) {
                        authenticationStore.setTokens(res.data.access_token, res.data.refresh_token);
                    }
                } catch (e) {
                    return toaster.error(e);
                }
            }

            // Check for query in parameter or push to index
            const redirect = route.query.redirect as string;
            if (redirect) {
                router.push({ path: redirect });
            } else {
                router.push("/")
            }
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
            user,
            password,
            isLoading,

            unlockVault,
            logoutUser
        }
    }
})
</script>