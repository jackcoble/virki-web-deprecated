<template>
    <div class="bg-grey-lighter min-h-screen flex flex-col">
        <div class="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
            <div class="bg-gray-200 px-6 py-8 rounded shadow-md text-black w-full">
                <h1 class="mb-8 text-3xl text-center">Sign up</h1>

                <form @submit.prevent="registerUser">
                    <input type="text" class="block border border-grey-light w-full p-3 rounded mb-4" name="email"
                        v-model="email" placeholder="Email" required autofocus />

                    <input type="text" class="block border border-grey-light w-full p-3 rounded mb-4" name="name"
                        v-model="name" placeholder="Name" required />

                    <input type="password" class="block border border-grey-light w-full p-3 rounded mb-4"
                        name="password" v-model="password" placeholder="Password" required />
                    <input type="password" class="block border border-grey-light w-full p-3 rounded mb-4"
                        name="confirm_password" placeholder="Confirm Password" required />

                    <!-- TODO: Add tickbox -->
                    <div class="text-center text-sm text-grey-dark mt-4">
                        By signing up, you agree to the
                        <a class="no-underline border-b border-grey-dark text-grey-dark" href="#">
                            Terms of Service
                        </a> and
                        <a class="no-underline border-b border-grey-dark text-grey-dark" href="#">
                            Privacy Policy
                        </a>
                    </div>

                    <button type="submit"
                        class="w-full text-center py-3 rounded bg-green text-white bg-gray-600 focus:outline-none my-1">Create
                        Account</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Account } from "@/class/account";
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

        const router = useRouter();
        const encryptionKeyStore = useEncryptionKeyStore();

        // Create a user account
        const registerUser = async () => {
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
            const accountPayload = {
                email: email.value,
                name: name.value,
                password: {
                    hash: Buffer.from(stretchedKeyHashBytes).toString("base64"),
                    salt: pPassword.salt
                },
                encryptedMasterKey: encryptedMasterKey
            }

            console.log(accountPayload)

            // Store encrypted master key in IndexedDB for offline use
            await account.insertUserToDB(email.value, encryptedMasterKey);

            // Push to main page
            router.push("/");
        }

        return {
            email,
            name,
            password,

            registerUser
        }
    }
})
</script>