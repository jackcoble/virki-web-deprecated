<template>
    <div class="flex justify-center items-center h-screen md:bg-gray-100 bg-white">
        <div class="p-6 rounded md:shadow-sm md:bg-white md:border md:border-gray-200 space-y-3 sm:w-2/6 w-full">
            <!-- Header -->
            <h1 class="text-lg text-center">Create an Authoriser account.</h1>

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
                <div class="form-check">
                    <input required class="form-check-input h-4 w-4 border border-gray-300 rounded-sm focus:outline-none transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer" type="checkbox" v-model="acceptedTerms" id="acceptedTermsCheck">
                    <label class="form-check-label text-xs inline-block text-gray-800" for="acceptedTermsCheck">
                        By checking this box, you agree to the Terms of Service and Privacy Policy.
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

            // Made it to the derivation stage of the account, so set isLoading value
            isLoading.value = true;

            // Randomly generate a master keypair and initialise the Account class
            const masterKeyPair = await Crypto.generateKeyPair();
            const account = new Account(masterKeyPair.privateKey, masterKeyPair.publicKey);

            // Stretch the password into a stronger key and use it to encrypt the master private key
            const stretched = await account.deriveStretchedPassword(password.value);
            const encryptedMasterPrivateKey = await Crypto.encrypt(
                await Crypto.fromBase64(masterKeyPair.privateKey),
                await Crypto.fromBase64(stretched.key)
            );

            // Derive a SHA-256 hash of the stretched password (used for authentication)
            const passwordHash = await Crypto.sha256hash(await Crypto.fromBase64(stretched.key));

            // We have all the data we need for now, so construct an account payload that will be sent to the API
            const accountPayload: IAccount = {
                email: email.value,
                name: name.value,
                password: {
                    hash: passwordHash,
                    salt: stretched.salt
                },
                encrypted_master_keypair: {
                    private_key: encryptedMasterPrivateKey,
                    public_key: masterKeyPair.publicKey
                }
            }

            if (passwordHint.value) {
                accountPayload.password.hint = passwordHint.value;
            }

            // Send account payload to API
            try {
                await authentication.RegisterAccount(accountPayload).then(res => {
                    return toaster.success("Account created! Please sign in.")
                })
            } catch (e) {
                return toaster.error(e.response.data.error)
            } finally {
                isLoading.value = false;
            }

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