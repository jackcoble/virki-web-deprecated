<template>
    <div class="flex justify-center items-center h-screen bg-mine-shaft">
        <div class="p-8 m-8 md:m-auto rounded md:shadow-sm bg-white md:border md:border-gray-200 space-y-3 sm:w-3/12 w-full">
            <!-- Header -->
            <img class="w-24 mx-auto" src="@/assets/images/virki_logo_transparent.png" alt="Virki Logo">
            <h1 class="text-xl text-center">Welcome to <span class="text-mountain-meadow">Virki</span>.</h1>

            <form @submit.prevent="handleSignIn" class="space-y-2">
                <!-- Email input -->
                <p class="font-bold text-sm">Email Address</p>
                <b-input type="email" v-model="email" autofocus />

                <!-- Master password -->
                <p class="font-bold text-sm pt-2">Master Password</p>
                <b-password-input v-model="password" />

                <!-- Login and Create buttons -->
                <div class="flex flex-wrap md:flex-nowrap justify-center items-center md:space-x-2 space-y-2 md:space-y-0 pt-3">
                    <b-button type="submit" classType="primary" :loading="isLoading">
                        <div class="flex flex-row justify-center items-center">
                            <LoginIcon class="w-4 mr-1" />
                            <span>Log In</span>
                        </div>
                    </b-button>

                    <b-button classType="light" @click="router.push('/signup')">
                        <div class="flex flex-row justify-center items-center">
                            <UserAddIcon class="w-4 mr-1" />
                            <span>Create Account</span>
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
import userService from "@/service/api/userService";
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { ClockIcon, LoginIcon, UserAddIcon } from "@heroicons/vue/outline";
import { Crypto } from "@/class/crypto";
import { useApplicationStore } from "@/stores/appStore";
import { AUTHORISER_SYNC_URL, SYNC_TYPE } from "@/class/pouchdb";
import usePouchDB from "@/composables/usePouchDB";
import useVault from "@/composables/useVault";
import { useVaultStore } from "@/stores/vaultStore";
import { Token } from "@/class/token";

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
        const vaultStore = useVaultStore();

        const toaster = useToaster();
        const account = new Account("", "");
        const vault = useVault();

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
                    authenticationStore.setTokens(res.data.access_token, res.data.refresh_token);
                }

                // Fetch encrypted user account and decrypt the master keypair with the stretched password.
                // Whilst we are here we can set some application data in the store from the account response.
                res = await userService.GetAccount();
                if (res.data) {
                    const userAccount = res.data as IAccount;
                    
                    // So that Authoriser can be used offline, store the password hash, and encrypted master keypair in LocalStorage.
                    authenticationStore.setPassword(userAccount.password.hash, userAccount.password.salt);
                    encryptionKeyStore.setEncryptedMasterKey(res.data.encrypted_master_keypair.private_key, res.data.encrypted_master_keypair.public_key);

                    // Also store some basic account data, such as Email, Name and Profile picture in LocalStorage
                    authenticationStore.setUser(userAccount.email, userAccount.name);

                    // Once that is set, we can proceed to decrypt the master keypair at store it in memory.
                    const encryptedMasterKeypair = encryptionKeyStore.getEncryptedMasterKey;
                    const decryptedMasterPrivateKey = await Crypto.decrypt(encryptedMasterKeypair.private_key, await Crypto.fromBase64(extended.key));
                    encryptionKeyStore.setMasterKeyPair(await Crypto.toBase64(decryptedMasterPrivateKey), encryptedMasterKeypair.public_key);
                }

                // Lastly, we need to determine the syncing method to be used. If no sync data object is present,
                // then default to the Authoriser Sync Server.
                const syncData = applicationStore.getSync;
                if (!syncData.db || !syncData.url) {
                    // Construct the database name to sync to
                    const trimmedUserID = authenticationStore.getActiveAccount.replace(/-/g, "");
                    const dbName = `user_db-${trimmedUserID}`;

                    const syncServerURL = `${AUTHORISER_SYNC_URL}/${dbName}`;

                    // Update application state with new sync data
                    applicationStore.setSync(SYNC_TYPE.CLOUD, dbName, syncServerURL);
                }

                // More for a UX perspective, we should fetch all vaults, decrypt and set the active vault where possible.
                // Synchronise if possible from remote.
                const pouchDB = usePouchDB();
                await pouchDB.synchronise();
                const encryptedVaults = await pouchDB.getVaults();

                encryptedVaults.forEach(async v => {
                    const decrypted = await vault?.decryptFromVaultObject(v, encryptionKeyStore.getMasterKeyPair.private_key, encryptionKeyStore.getMasterKeyPair.public_key);
                    vaultStore.add(decrypted!);
                    vaultStore.setActiveVault(decrypted!._id);
                })

                // Do the same for tokens...
                const token = new Token();
                const encryptedTokens = await pouchDB.getTokens();
                encryptedTokens.forEach(async t => {
                    // Need to fetch the decrypted vault as it contains the symmetric key
                    const vaultBelongingToToken = vaultStore.getVaults.find(v => v._id === t.vault);
                    if (!vaultBelongingToToken) {
                        // TODO: Throw error as something has gone wrong here...
                        return;
                    }

                    const key = vaultBelongingToToken.key;
                    const decryptedToken = await token.decryptFromTokenObject(t, key);

                    vaultStore.addToken(decryptedToken);
                })

                // Push to Index
                router.push("/");
            } catch (e) {
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