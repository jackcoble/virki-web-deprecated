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
            let passwordHash = '';

            // Fetch account details and determine password hash
            try {
                const res = await user.GetAccount();
                if (res.data) {
                    passwordHash = await account.deriveHashedStretchedPassword(password.value, res.data.password.salt);
                }
            } catch (e) {
                toaster.error(e.response.data.error)
            }

            try {
                // Try deauthorise sessions via API and then clean out local data
                    const res = await authentication.Deauthorise(passwordHash);
                    authenticationStore.clear();
                    encryptionKeyStore.clear();

                    toaster.success(res.data);

                    router.push("/");
            } catch (e) {
                toaster.error(e.response.data.error);
            }
        }

        return {
            password,

            deauthoriseSessions
        };
    },
});
</script>