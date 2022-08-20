<template>
    <div class="flex justify-center items-center h-screen bg-mine-shaft p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <h1 class="text-xl text-center">We've sent a verification code to <span class="text-mountain-meadow">{{ email }}</span></h1>
            <p class="text-xs">If you haven't received a verification code within a couple of minutes, please check your spam or request for a new code to be sent.</p>

            <form @submit.prevent="handleVerification" class="space-y-2">
                <b-input type="text" v-model.number="otp" placeholder="Verification code" autofocus />

                <!-- Verify button -->
                <b-button class="flex justify-center items-center space-x-1" type="submit" classType="primary" :loading="isLoading">
                    <CheckIcon class="w-4" />
                    <span>Verify</span>
                </b-button>
            </form>

            <!-- Resend options -->
            <div class="flex justify-between">
                <button class="text-sm text-mine-shaft hover:text-mountain-meadow-50 transition">Resend code</button>
                <button class="text-sm text-mine-shaft hover:text-mountain-meadow-50 transition" @click="router.push('/login')">Change email</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import useToaster from "@/composables/useToaster";
import userService from "@/service/api/userService";

import { CheckIcon } from "@heroicons/vue/outline";
import { getData, LS_KEYS } from "@/utils/storage/localStorage";
import type { Keys } from "@/types/user";
import { getKey, SESSION_KEYS } from "@/utils/storage/sessionStorage";
import { getDedicatedCryptoWorker } from "@/utils/comlink";

import * as bip39 from "@scure/bip39"
import { wordlist } from '@scure/bip39/wordlists/english';
import { useKeyStore } from "@/stores/keyStore";

export default defineComponent({
    name: "Login",
    components: {
        CheckIcon
    },
    setup() {
        const email = ref("");
        const otp = ref();

        const isLoading = ref(false);

        const router = useRouter();
        const route = useRoute();
        const keyStore = useKeyStore();

        const toaster = useToaster();

        onMounted(() => {
            // Fetch the user data from LocalStorage
            const userData = getData(LS_KEYS.USER_DETAILS);
            if (userData) {
                email.value = userData.email;
            }
        })

        // Handle OTP verification and signin/signup as necessary
        const handleVerification = async () => {
            isLoading.value = true;

            // Verify the OTP with the expectation to receive a session token back!
            try {
                const res = await userService.VerifyOTP(email.value, otp.value);
                keyStore.setSessionToken(res.data.session);
            } catch (e) {
                return toaster.error("An unknown error has occurred.");
            }

            // Check the "type" parameter. If we've got signup,
            // then we need to send the encrypted keys to our API
            // and then prompt the user to backup their recovery key.
            const verifyType = route.query.type as string;
            if (!verifyType) {
                return toaster.error("Verification type not present in URL!");
            }

            switch (verifyType) {
                case "signup":
                    // Send keys to API
                    const encryptedKeys: Keys = getData(LS_KEYS.KEYS);
                    if (!encryptedKeys) {
                        return toaster.error("Encrypted keys are not on device!");
                    }

                    try {
                        await userService.AddEncryptedKeys(encryptedKeys)
                    } catch (e) {
                        // TODO: Handle error
                    }

                    const cryptoWorker = await getDedicatedCryptoWorker();

                    // Using the master encryption key, decrypt the recovery key and provide it to BIP39 as entropy.
                    // Show this to the user...
                    const masterEncryptionKey = getKey(SESSION_KEYS.MASTER_ENCRYPTION_KEY);
                    const recoveryKey = await cryptoWorker.decrypt(masterEncryptionKey, encryptedKeys.recovery.recovery_key_encrypted_with_master_key);
                    const recoveryKeyBuffer: Uint8Array = await cryptoWorker.fromBase64(recoveryKey);
                    
                    const mnemonic = bip39.entropyToMnemonic(recoveryKeyBuffer, wordlist);
                    console.log("Recovery Key:", mnemonic);

                    // Route to account recovery
                    router.push({ path: "/recovery" });
                    
                    break;
            
                default:
                    break;
            }
        }

        return {
            email,
            otp,
            isLoading,

            router,

            handleVerification
        }
    }
})
</script>