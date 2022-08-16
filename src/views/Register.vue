<template>
    <div class="flex justify-center items-center h-screen md:bg-gray-200 bg-white">
        <div class="p-6 rounded-md md:shadow md:bg-white md:border md:border-gray-200 space-y-3 sm:w-3/12 w-full">
            <!-- Header -->
            <div class="space-y-1">
                <h1 class="font-medium text-xl text-purple-800 text-center">Authoriser</h1>
                <p class="text-xs text-center">Create an account to secure your authentication tokens.</p>
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
                <div class="flex items-center space-x-2 focus:outline-none">
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
import { Account, type IAccount } from "@/class/account";
import { Crypto } from "@/class/crypto";
import useToaster from "@/composables/useToaster";
import authentication from "@/service/api/authentication";
import { generateKeys } from "@/utils/crypto";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
    name: "Login",
    setup() {
        // Refs to keep track of user data
        const email = ref("");
        const name = ref("");
        const password = ref("");
        const confirmPassword = ref("");
        const passwordHint = ref("");
        const acceptedTerms = ref(false);
        const isLoading = ref(false);

        const toaster = useToaster();
        const router = useRouter();

        // Create a user account
        const registerUser = async () => {
            /* 
            First we need to carry out some client-side checks:
            - Password confirmation matches password
            - Password hint doesn't contain the master password
            - Minimum password length of 12 characters
            */
            if (confirmPassword.value !== password.value) {
                return toaster.error("Passwords do not match!")
            }

            if (passwordHint.value.includes(password.value)) {
                return toaster.error("Password hint cannot include master password!")
            }

            if (password.value.length < 12) {
                return toaster.error("Password must be at least 12 characters long!")
            }

            // Generate all the keys we need
            isLoading.value = true;

            alert("isLoading: " + isLoading.value);

            const keys = await generateKeys(password.value);
            console.log(keys);

            isLoading.value = false;

            // Push to index
            router.push("/login");
        }

        return {
            email,
            name,
            password,
            confirmPassword,
            passwordHint,
            acceptedTerms,
            isLoading,

            router,

            registerUser
        }
    }
})
</script>