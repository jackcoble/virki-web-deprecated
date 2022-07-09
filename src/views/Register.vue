<template>
    <div class="flex justify-center items-center h-screen">
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
import { defineComponent, ref } from "vue";
import zxcvbn from "zxcvbn";

export default defineComponent({
    name: "Login",
    setup() {
        // Refs to keep track of user data
        const email = ref("");
        const password = ref("");

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

            // Encrypt the master key
            // TODO: Send to server
            const eMK = await account.encryptMasterKey(pPassword.key);

            // For testing, decrypt the master key...
            const decryptedMasterKey = await account.decryptMasterKey(password.value, pPassword.salt, eMK);
            console.log("decrypted:", decryptedMasterKey);
        }

        return {
            email,
            password,

            registerUser
        }
    }
})
</script>