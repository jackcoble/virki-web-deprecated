<template>
    <BaseModal :show="show" @ok="deauthoriseSessions" okFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">De-authorise sessions?</h1>
                <p class="text-sm">
                    You are about to de-authorise all devices. This is a recommended security step if you have lost a
                    device, or no longer have access to it.
                </p>

                <!-- Password -->
                <p class="font-bold text-sm">Master Password</p>
                <b-password-input v-model="password" />
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useRouter } from "vue-router";
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

            // Derive hashed stretched password
            try {
                const salt = authenticationStore.getPasswordSalt;
                if (salt) {
                    passwordHash = await account.deriveHashedStretchedPassword(password.value, salt);
                } else {
                    toaster.error("Master password salt not present.")
                    return;
                }
            } catch (e) {
                toaster.error(e)
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