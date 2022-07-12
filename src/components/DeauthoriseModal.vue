<template>
    <BaseModal :show="show" @ok="deauthoriseSessions" okFooter>
        <div class="space-y-2">
            <h1 class="text-xl text-center">De-authorise sessions?</h1>
            <p class="text-sm">
                You are about to de-authorise all devices. This is a recommended security step if you have lost a
                device, or no longer have access to it.
            </p>

            <!-- Password -->
            <p class="font-bold text-sm">Master Password</p>
            <input type="password"
                v-model="password"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </div>
    </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useRouter } from "vue-router";
import user from "@/service/api/user";
import { Account } from "@/class/account";
import authentication from "@/service/api/authentication";
import useToaster from "@/composables/useToaster";
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default defineComponent({
    components: {
        BaseModal,
    },
    props: {
        show: {
            type: Boolean,
        },
    },
    setup() {
        const router = useRouter();
        const toaster = useToaster();
        const account = new Account();

        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();

        const password = ref("");

        // Attempt to deauthorise user sessions
        const deauthoriseSessions = async () => {
            // Get account details and generate master password hash
            try {
                const res = await user.GetAccount();
                if (res.data) {
                    console.log(res.data.password.salt);
                    const saltBuffer = Buffer.from(res.data.password.salt, "base64");
                    const extended = await account.deriveStretchedPassword(password.value, saltBuffer);

                    // Using the extended key we can generate a SHA-256 hash of it to send to the login endpoint.
                    const stretchedKeyBytes = new TextEncoder().encode(extended.key);
                    const stretchedKeyHashBytes = await window.crypto.subtle.digest("SHA-256", stretchedKeyBytes);
                    const stretchedKeyHashEncoded = Buffer.from(stretchedKeyHashBytes).toString("base64");

                    // Try deauthorise sessions via API and then clean out local data
                    await authentication.Deauthorise(stretchedKeyHashEncoded);
                    authenticationStore.clear();
                    encryptionKeyStore.clear();

                    router.push("/");
                }
            } catch (e) {
                toaster.error(e.response.data.error)
            }
        }

        return {
            password,

            deauthoriseSessions
        };
    },
});
</script>