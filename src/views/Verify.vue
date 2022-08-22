<template>
    <div class="flex justify-center items-center h-screen bg-gray-100 p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <h1 class="text-xl text-center">We've sent a verification code to <span class="text-mountain-meadow">{{ email }}</span></h1>
            <p class="text-xs">If you haven't received a verification code within a couple of minutes, please check your spam or request for a new code to be sent.</p>

            <form @submit.prevent="handleVerification" class="space-y-2">
                <b-input type="text" v-model.number="otp" placeholder="Verification code" autofocus required />

                <!-- Verify button -->
                <b-button class="flex justify-center items-center space-x-1" type="submit" classType="primary" :loading="isLoading">
                    <CheckIcon class="w-4" />
                    <span>Verify</span>
                </b-button>
            </form>

            <!-- Resend options -->
            <div class="flex justify-between">
                <button class="text-sm text-mine-shaft hover:text-mountain-meadow-50 transition" @click="resendOTP">Resend code</button>
                <button class="text-sm text-mine-shaft hover:text-mountain-meadow-50 transition" @click="router.push('/')">Change email</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import useToaster from "@/composables/useToaster";
import userService from "@/service/api/userService";

import { CheckIcon } from "@heroicons/vue/outline";
import type { Keys } from "@/types/user";

import { useKeyStore } from "@/stores/keyStore";
import { useUserStore } from "@/stores/userStore";
import { computed } from "@vue/reactivity";

export default defineComponent({
    name: "Login",
    components: {
        CheckIcon
    },
    setup() {
        const email = computed(() => userStore.getEmail);
        const otp = ref();

        const isLoading = ref(false);

        const router = useRouter();

        const userStore = useUserStore();
        const keyStore = useKeyStore();

        const toaster = useToaster();

        // Handle OTP verification and signin/signup as necessary
        const handleVerification = async () => {
            isLoading.value = true;

            // Verify the OTP with the expectation to receive a session token back!
            try {
                const res = await userService.VerifyOTP(email.value, otp.value);
                keyStore.setSessionToken(res.data.session);

                // Check the response data for an encrypted keys object. If it's present
                // then the user already has an account, so we can move them straight onto
                // entering their password for decryption.
                if (res.data.encrypted_keys) {
                    // Save the encrypted keys object
                    const encryptedKeys: Keys = res.data.encrypted_keys;
                    keyStore.setEncryptedKeys(encryptedKeys);

                    router.push({ path: "/credentials" });
                    return;
                }
            } catch (e) {
                isLoading.value = false;

                // We expect this from the API.
                if (e.response && e.response.data.error) {
                    return toaster.error(e.response.data.error);
                }

                return toaster.error("An unknown error has occurred.");
            }

            // If we've made it this far, then the user doesn't have any encryption
            // keys tied to their account. We should be able to retrieve the ones
            // generated and stored in the "keyStore".
            const encryptedKeys = keyStore.getEncryptedKeys;
            if (!encryptedKeys.master_encryption_key) {
                isLoading.value = false;
                router.push({ path: "/register" });

                return toaster.error("Encrypted keys are not on device!");
            }

            // Send them to our API for safe-keeping.
            try {
                await userService.AddEncryptedKeys(encryptedKeys);
            } catch (e) {
                return toaster.error("Unable to save encrypted keys to API.")
            }

            // As we should have the master encryption key in the "keyStore",
            // we should be able to direct the user to the recovery page
            // where they are prompted to write down their recovery phrase in
            // case they forget their password.
            const masterEncryptionKey = keyStore.getMasterEncryptionKey;
            if (!masterEncryptionKey) {
                return toaster.error("Master encryption key is not present on device!")
            }

            router.push("/recovery");
        }

        // When requested, resend an OTP code to the users email
        const resendOTP = async () => {
            try {
                await userService.SendOTP(email.value)
            } catch (e) {
                return toaster.error("Unexpected error!");
            }
        }

        return {
            email,
            otp,
            isLoading,

            router,

            handleVerification,
            resendOTP
        }
    }
})
</script>