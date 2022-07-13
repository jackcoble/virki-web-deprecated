<template>
    <h1 class="text-xl p-4">Locked!</h1>
    <p class="text-sm">Currently logged in as: {{ email }}</p>

    <!-- Input to unlock -->
    <!-- Password -->
    <p class="font-bold text-sm">Master Password</p>
    <input type="password" v-model="password"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">

    <!-- Unlock button -->
    <button class="p-3 w-full rounded bg-blue-400 text-blue-900 hover:bg-blue-300 hover:text-blue-700" @click="unlockVault">
            Unlock
        </button>
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

export default defineComponent({
    name: "Lock",
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
            }

            // Push to index
            router.push("/")
        }

        return {
            email,
            password,

            unlockVault
        }
    }
})
</script>