<template>
    <div class="flex justify-center items-center h-screen dark:bg-gray-900">
        <form @submit.prevent="registerUser">
            <div class="mb-6">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email
                    address</label>
                <input type="email" id="email" v-model="email"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Email address" required autofocus>
            </div>
            <div class="mb-6">
                <label for="password"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Password</label>
                <input type="password" id="password" placeholder="●●●●●●●●●●●●●●" v-model="password"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required>
            </div>
            <button type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign
                Up</button>
        </form>
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
                passwordHash: Buffer.from(stretchedKeyHashBytes).toString("base64"),
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
            password,

            registerUser
        }
    }
})
</script>