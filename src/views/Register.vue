<template>
    <div class="flex flex-col justify-center items-center h-screen bg-gray-100 p-8">
        <div class="flex flex-col p-8 md:m-auto space-y-3 xl:w-3/12 md:w-1/2 sm:w-3/4 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <div space-y-1>
                <h1 class="text-xl text-center">Create your <span class="text-mountain-meadow">Virki</span> account.</h1>
                <p class="text-xs text-center">Your secure two-factor authentication vault.</p>
            </div>

            <form @submit.prevent="registerUser" class="space-y-2">
                <!-- Email input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Email Address</p>
                    <b-input type="email" required v-model="email" autofocus />
                </div>

                <!-- Name input -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm">Name</p>
                    <b-input type="text" required v-model="name" />
                </div>

                <!-- Password -->
                <div class="space-y-1.5">
                    <p class="font-bold text-sm pt-2">Password</p>
                    <b-password-input v-model="password" :showStrength="true" />
                </div>
                <div>
                    <password-strength :password="password" />
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
                    <b-button type="submit" classType="primary" :disabled="!acceptedTerms" disabledText="Generating keys..." :loading="isLoading">
                        Submit
                    </b-button>

                    <b-button classType="light" @click="router.push('/')">
                        Cancel
                    </b-button>
                </div>
            </form>
        </div>

         <!-- Version information -->
         <div class="flex p-2">
            <p class="text-xs text-center text-gray-500">Virki Web Client - v{{ version }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import useToaster from "@/composables/useToaster";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import { cryptoWorker } from "@/common/comlink";
import type { StretchedPassword } from "@/common/interfaces/password";
import type { EncryptionResult } from "@/common/interfaces/encryption";
import { serialiseCipherString } from "@/common/utils/cipher";
import { EncryptionType } from "@/common/enums/encryptionType";
import type { StringKeyPair } from "libsodium-wrappers-sumo";
import { PAGES } from "@/router/pages";
import { version } from "../../package.json";
import userService from "@/service/api/userService"
import { useUserStore } from "@/stores/userStore";
import type { AccountRegistrationRequestBody } from "@/service/api/types";

export default defineComponent({
    name: "Register",
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

        const userStore = useUserStore();

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

            // Stretch the provided password into a Key Encryption Key (KEK)
            const stretchedPassword: StretchedPassword = await cryptoWorker.stretchPassword(password.value)
            
            // Generate a standalone encryption key and encrypt it with the KEK
            const encryptionKey = await cryptoWorker.generateEncryptionKey();
            const encryptedMasterKey: EncryptionResult = await cryptoWorker.encryptToB64(encryptionKey, stretchedPassword.key);
            const encryptedMasterKeyCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedMasterKey.ciphertext, encryptedMasterKey.nonce, encryptedMasterKey.mac);

            // Generate an X25519 keypair, and encrypt the private key with the encryption key
            const keypair: StringKeyPair = await cryptoWorker.generateKeypair();
            const keypairEncryptedPrivateKey: EncryptionResult = await cryptoWorker.encryptToB64(keypair.privateKey, encryptionKey);
            const keypairEncryptedCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, keypairEncryptedPrivateKey.ciphertext, keypairEncryptedPrivateKey.nonce, keypairEncryptedPrivateKey.mac);

            // Generate recovery keys...
            // Encrypt the master key with the recovery key,
            // and then recovery key with master key.
            const recoveryKey = await cryptoWorker.generateEncryptionKey();
            const masterKeyEncryptedWithRecoveryKey = await cryptoWorker.encryptToB64(encryptionKey, recoveryKey);
            const recoveryKeyEncryptedWithMasterKey = await cryptoWorker.encryptToB64(recoveryKey, encryptionKey);

            // Generate cipher strings for all of the keys
            const masterKeyEncryptedWithRecoveryKeyCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, masterKeyEncryptedWithRecoveryKey.ciphertext, masterKeyEncryptedWithRecoveryKey.nonce, masterKeyEncryptedWithRecoveryKey.mac);
            const recoveryKeyEncryptedWithMasterKeyCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, recoveryKeyEncryptedWithMasterKey.ciphertext, recoveryKeyEncryptedWithMasterKey.nonce, recoveryKeyEncryptedWithMasterKey.mac);
            
            // Submit the user information and encrypted keys to the API.
            // We want to send the encrypted cipher strings here...
            try {
                const requestBody: AccountRegistrationRequestBody = {
                    email: email.value,
                    name: name.value,
                    keys: {
                        kek: {
                            hash: stretchedPassword.hash,
                            salt: stretchedPassword.salt,
                            opsLimit: stretchedPassword.opsLimit,
                            memLimit: stretchedPassword.memLimit
                        },
                        masterEncryptionKey: encryptedMasterKeyCipherString,
                        sharing: {
                            publicKey: keypair.publicKey,
                            privateKey: keypairEncryptedCipherString
                        },
                        recovery: {
                            masterKeyEncryptedWithRecoveryKey: masterKeyEncryptedWithRecoveryKeyCipherString,
                            recoveryKeyEncryptedWithMasterKey: recoveryKeyEncryptedWithMasterKeyCipherString
                        }
                    }
                }
                
                // Send off all the account details. If successful, then we'll get a response containing
                // a session token. We can store this in the store.
                await userService.Register(requestBody).then(res => {
                    userStore.setEmail(requestBody.email);
                    userStore.setSessionToken(res.data.session);
                })

                // Fetch the encrypted keys for the account. These should be saved
                await userService.GetKeys().then(res => {
                    userStore.setKeys(res.data);
                })

                router.push(PAGES.LOGIN);
            } catch (e) {
                toaster.error(e.response.data.error);
            } finally {
                isLoading.value = false;
            }
        }

        return {
            email,
            name,
            password,
            confirmPassword,
            acceptedTerms,
            isLoading,

            router,

            version,

            registerUser
        }
    }
})
</script>