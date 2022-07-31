<template>
    <div class="flex justify-center items-center h-screen md:bg-gray-100 bg-white">
        <div class="p-8 rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 sm:w-2/6 w-full">
            <!-- Header -->
            <ClockIcon class="h-24 text-purple-800 p-2 mx-auto" />
            <h1 class="text-lg text-center">Log in or create an Authoriser account.</h1>

            <form @submit.prevent="handleSignIn" class="space-y-2">
                <!-- Email input -->
                <p class="font-bold text-sm">Email Address</p>
                <b-input type="email" v-model="email" autofocus />

                <!-- Master password -->
                <p class="font-bold text-sm pt-2">Master Password</p>
                <b-password-input v-model="password" />

                <!-- Unlock and Logout buttons -->
                <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                    <b-button type="submit" classType="primary" :loading="isLoading">
                        <div class="flex flex-row justify-center">
                            <LoginIcon class="w-4 mr-1" />
                            Log In
                        </div>
                    </b-button>

                    <b-button classType="light" @click="router.push('/signup')">
                        <div class="flex flex-row justify-center">
                            <UserAddIcon class="w-4 mr-1" />
                            Create Account
                        </div>
                    </b-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { Account, type IAccount } from "@/class/account";
import useToaster from "@/composables/useToaster";
import authentication from "@/service/api/authentication";
import user from "@/service/api/user";
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { ClockIcon, LoginIcon, UserAddIcon } from "@heroicons/vue/outline";
import { Crypto } from "@/class/crypto";
import useAuthoriserDB from "@/composables/useAuthoriserDB";
import { useApplicationStore } from "@/stores/appStore";

export default defineComponent({
    name: "Login",
    components: {
        ClockIcon,
        LoginIcon,
        UserAddIcon
    },
    setup() {
        const email = ref("");
        const password = ref("");
        const isLoading = ref(false);

        const router = useRouter();
        const applicationStore = useApplicationStore();
        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();
        const authoriserDB = useAuthoriserDB();
        const toaster = useToaster();
        const account = new Account("", "");

        // Handle user login
        const handleSignIn = async () => {
            isLoading.value = true;

            // Using the email address, request carry out a pre-login check for salt.
            // If we can, extend the password using it
            try {
                let res = await authentication.PreLogin(email.value);
                const salt: string = res.data.password_salt;

                // Extend the password with the provided salt and create a SHA-256 hash
                const extended = await account.deriveStretchedPassword(password.value, salt);
                const passwordHash = await Crypto.sha256hash(await Crypto.fromBase64(extended.key));

                // Attempt to login and set access/refresh tokens in store
                res = await authentication.Login(email.value, passwordHash);
                if (res.data && res.data.access_token && res.data.refresh_token) {
                    authenticationStore.setEmail(email.value);
                    authenticationStore.setPasswordSalt(salt);
                    authenticationStore.setAccessToken(res.data.access_token);
                    authenticationStore.setRefreshToken(res.data.refresh_token);
                }

                // Fetch encrypted user account and decrypt the master keypair with the stretched password
                res = await user.GetAccount();
                if (res.data) {
                    const encryptedMasterPrivateKey = res.data.encrypted_master_keypair.private_key;
                    const masterPublicKey = res.data.encrypted_master_keypair.public_key;

                    const decryptedMasterPrivateKey = await Crypto.decrypt(encryptedMasterPrivateKey, await Crypto.fromBase64(extended.key));
                    encryptionKeyStore.setMasterKeyPair(await Crypto.toBase64(decryptedMasterPrivateKey), masterPublicKey);

                    applicationStore.setSyncDB(res.data.sync_db);

                    // Set the active user and save account to IndexedDB
                    authenticationStore.setActiveAccount(res.data.uid);
                    await authoriserDB.insertAccount(res.data as IAccount);
                }

                // Push to Index
                router.push("/");
            } catch (e) {
                isLoading.value = false;

                if (e.response.data && e.response.data.error) {
                    toaster.error(e.response.data.error);
                    return;
                } else {
                    toaster.error("An unknown error has occurred.");
                    return;
                }
            } finally {
                isLoading.value = false;
            }
        }

        return {
            email,
            password,
            isLoading,

            router,

            handleSignIn
        }
    }
})
</script>