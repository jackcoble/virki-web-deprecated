<template>
    <div class="flex justify-center items-center h-screen bg-gray-100">
        <div class="p-6 rounded shadow-sm bg-white border border-gray-200 space-y-3 sm:w-2/6 w-full">
            <!-- Header -->
            <h1 class="text-lg text-center">Create an Authoriser account.</h1>

            <form @submit.prevent="registerUser" class="space-y-3">
                <!-- Email input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Email Address</p>
                    <b-input type="email" required v-model="email" />
                </div>

                <!-- Name input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Name</p>
                    <b-input type="text" required v-model="name" />
                    <p class="text-xs">What do you like to be called?</p>
                </div>

                <!-- Master password -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm pt-2">Master Password</p>
                    <b-password-input v-model="password" />
                    <password-strength :password="password" />
                    <p class="text-xs">This password is used to access your token vault. It is important that you do not forget it, as due to the nature of encryption we cannot recover it for you.</p>
                </div>

                <!-- Confirm master password input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Confirm Master Password</p>
                    <b-password-input v-model="confirmPassword" />
                </div>

                <!-- Master password hint input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Master Password Hint</p>
                    <b-input type="text" v-model="passwordHint" />
                    <p class="text-xs">Setting a hint is optional, but can help jog your memory in the event you forget your master password!</p>
                </div>

                <!-- Terms of Service and Privacy Policy tickbox -->
                <div class="form-check">
                    <input required class="form-check-input h-4 w-4 border border-gray-300 rounded-sm focus:outline-none transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer" type="checkbox" v-model="acceptedTerms" id="acceptedTermsCheck">
                    <label class="form-check-label text-xs inline-block text-gray-800" for="acceptedTermsCheck">
                        By checking this box, you agree to the Terms of Service and Privacy Policy.
                    </label>
                </div>

                <!-- Submit and Cancel buttons -->
                <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                    <b-button type="submit" classType="primary" :disabled="!acceptedTerms">
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
import { Account } from "@/class/account";
import useToaster from "@/composables/useToaster";
import type { IRegisterAccount } from "@/models/account";
import authentication from "@/service/api/authentication";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import zxcvbn from "zxcvbn";

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

        const toaster = useToaster();
        const router = useRouter();
        const encryptionKeyStore = useEncryptionKeyStore();

        // Create a user account
        const registerUser = async () => {
            /* 
            First we need to carry out some client-side checks:
            - Password confirmation matches password
            - Password hint doesn't contain the master password
            - Minimum password length of 12 characters
            - Password length/strength
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

            // Password strength
            const passwordStrength = zxcvbn(password.value);

            // Account initialisation
            // Derive a stretched (more secure) password for the user
            const account = new Account();
            const pPassword = await account.deriveStretchedPassword(password.value);

            // Generate and set the master key used for symmetric operations
            const masterKey = account.generateMasterKey();
            account.setMasterKey(masterKey);

            // Encode the master key to Base64 before setting it
            const masterKeyEncoded = Buffer.from(masterKey).toString("base64");
            encryptionKeyStore.setMasterKey(masterKeyEncoded);

            // Encrypt the master key
            const encryptedMasterKey = await account.encryptMasterKey(pPassword.key);

            // Generate a SHA-256 hash of the stretched key as we'll store this on the server for authentication
            const stretchedKeyBytes = new TextEncoder().encode(pPassword.key);
            const stretchedKeyHashBytes = await window.crypto.subtle.digest("SHA-256", stretchedKeyBytes);

            // Construct an account payload to be sent to the server
            const accountPayload: IRegisterAccount = {
                email: email.value,
                name: name.value,
                password: {
                    hash: Buffer.from(stretchedKeyHashBytes).toString("base64"),
                    salt: pPassword.salt
                },
                encrypted_master_key: encryptedMasterKey
            }

            if (passwordHint.value) {
                accountPayload.password.hint = passwordHint.value;
            }

            // Send account payload to server
            await authentication.RegisterAccount(accountPayload)

            // Store encrypted master key in IndexedDB for offline use
            await account.insertUserToDB(email.value, encryptedMasterKey);

            // Push to main page
            router.push("/");
        }

        return {
            email,
            name,
            password,
            confirmPassword,
            passwordHint,
            acceptedTerms,

            router,

            registerUser
        }
    }
})
</script>