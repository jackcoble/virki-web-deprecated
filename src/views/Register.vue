<template>
    <div class="flex justify-center items-center h-screen bg-mine-shaft p-8">
        <div class="p-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <div space-y-1>
                <h1 class="text-xl text-center">Create your <span class="text-mountain-meadow">Virki</span> account.</h1>
                <p class="text-xs text-center">Your secure two-factor authentication vault.</p>
            </div>

            <form @submit.prevent="registerUser" class="space-y-3">
                <!-- Email input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Email Address</p>
                    <b-input type="email" required v-model="email" />
                </div>

                <!-- Password -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm pt-2">Password</p>
                    <b-password-input v-model="password" :showStrength="true" />
                </div>

                <!-- Confirm password input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Confirm Password</p>
                    <b-password-input v-model="confirmPassword" />
                </div>

                <!-- Terms of Service and Privacy Policy tickbox -->
                <div class="flex justify-center items-center space-x-2 focus:outline-none">
                    <input required class="border border-gray-300 rounded-sm focus:outline-none cursor-pointer" type="checkbox" v-model="acceptedTerms" id="acceptedTermsCheck">
                    <label class="text-xs inline-block text-gray-800 cursor-pointer" for="acceptedTermsCheck">
                        I agree to the Terms of Service and Privacy Policy.
                    </label>
                </div>

                <!-- Submit and Cancel buttons -->
                <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                    <b-button type="submit" classType="primary" :disabled="!acceptedTerms" :loading="isLoading">
                        Submit
                    </b-button>

                    <b-button classType="light" @click="router.push('/login')">
                        Cancel
                    </b-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import useToaster from "@/composables/useToaster";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import { getDedicatedCryptoWorker } from "@/utils/comlink";
import { LS_KEYS, setData } from "@/utils/storage/localStorage";
import userService from "@/service/api/userService";

export default defineComponent({
    name: "Login",
    setup() {
        // Refs to keep track of user data
        const email = ref("");
        const name = ref("");
        const password = ref("");
        const confirmPassword = ref("");
        const acceptedTerms = ref(false);
        const isLoading = ref(false);

        const toaster = useToaster();
        const router = useRouter();

        // Create a user account
        const registerUser = async () => {
            /* 
            First we need to carry out some client-side checks:
            - Password confirmation matches password
            - Minimum password length of 12 characters
            */
            if (confirmPassword.value !== password.value) {
                return toaster.error("Passwords do not match!")
            }


            if (password.value.length < 12) {
                return toaster.error("Password must be at least 12 characters long!")
            }

            isLoading.value = true;

            // Store some registration details, such as email
            setData(LS_KEYS.USER_DETAILS, { email: email.value });

            // Make API request to send OTP to users email address
            try {
                await userService.SendOTP(email.value);
            } catch (error) {
                return toaster.error("Unexpected error sending email");
            }


            // Offload key generation onto CryptoWorker
            // and set the keys in LocalStorage.
            const cryptoWorker = getDedicatedCryptoWorker();
            const keys = await cryptoWorker.generateKeys(password.value);

            setData(LS_KEYS.KEYS, keys);

            isLoading.value = false;

            // Push to verification page
            router.push("/verify");
        }

        return {
            email,
            name,
            password,
            confirmPassword,
            acceptedTerms,
            isLoading,

            router,

            registerUser
        }
    }
})
</script>