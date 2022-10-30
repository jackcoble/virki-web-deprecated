<template>
    <div class="flex justify-center items-center h-screen bg-gray-100 p-8">
        <div class="p-8 md:m-auto space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <div space-y-1>
                <h1 class="text-xl text-center">Unlock your <span class="text-mountain-meadow">Virki</span> account.</h1>
                <p class="text-xs text-center">Please enter your master password to continue.</p>
            </div>

            <form @submit.prevent="handleUnlock" class="space-y-2">
                <!-- Password input -->
                <p class="font-bold text-sm">Password</p>
                <b-password-input v-model="password" placeholder="Master password" />

                <!-- Unlock and Logout buttons -->
                <div class="flex flex-wrap md:flex-nowrap justify-center items-center md:space-x-2 space-y-2 md:space-y-0 pt-3">
                    <b-button type="submit" classType="primary" :loading="isLoading">
                        <div class="flex flex-row justify-center items-center">
                            <LockOpenIcon class="w-4 mr-1" />
                            <span>Unlock</span>
                        </div>
                    </b-button>

                    <b-button type="button" classType="light" @click="handleLogout">
                        <div class="flex flex-row justify-center items-center">
                            <LogoutIcon class="w-4 mr-1" />
                            <span>Logout</span>
                        </div>
                    </b-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import useToaster from "@/composables/useToaster";
import { LogoutIcon, LockOpenIcon } from "@heroicons/vue/outline";
import type { StretchedPassword } from "@/common/interfaces/password";
import { CryptoWorker } from "@/common/comlink";
import { parseCipherString } from "@/common/utils/cipher";
import { useKeyStore } from "@/stores/keyStore";
import { PAGES } from "@/router/pages";
import { useLogout } from "@/composables/useLogout";
import userService from "@/service/api/userService";

export default defineComponent({
    name: "Lock",
    components: {
        LogoutIcon,
        LockOpenIcon
    },
    setup() {
        const password = ref("");
        const isLoading = ref(false);

        const router = useRouter();
        const toaster = useToaster();
        
        const keyStore = useKeyStore();

        // Handle the unlock process
        const handleUnlock = async () => {
            isLoading.value = true;

            // Fetch the encrypted keys from the Key Store.
            // We can then use that data to decrypt everything using the password.
            const cryptoWorker = await new CryptoWorker();
            const encryptedKeys = keyStore.getEncryptedKeys;

            try {
                const stretchedPassword: StretchedPassword = await cryptoWorker.stretchPassword(password.value, encryptedKeys.kek.salt, encryptedKeys.kek.ops_limit, encryptedKeys.kek.mem_limit);
                const encryptionKeyCipher = await parseCipherString(encryptedKeys.master_encryption_key);
                const encryptionKey = await cryptoWorker.decryptFromB64(encryptionKeyCipher.ciphertext, encryptionKeyCipher.mac, encryptionKeyCipher.nonce, stretchedPassword.key);

                // Set the encryption key and navigate to the vault
                keyStore.setMasterEncryptionKey(encryptionKey);
                router.push(PAGES.VAULT);
            } catch (e) {
                toaster.error("Unable to decrypt account!")
            } finally {
                // Stop the loading!
                isLoading.value = false;
            }
        }

        // Handle logout
        const handleLogout = async () => {
            try {
                await userService.Logout();
                await useLogout();
            } finally {
                // Ignore any errors and just push straight to root
                router.push(PAGES.ROOT);
            }
        }

        return {
            password,
            isLoading,

            router,

            handleUnlock,
            handleLogout
        }
    }
})
</script>