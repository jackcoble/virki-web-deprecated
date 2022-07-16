<template>
    <BaseModal :show="show" @ok="rememberEncryptionKey" okFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Remember encryption key?</h1>
                <p class="text-sm">
                    Before we remember your encryption key, please enter your master password below.
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
        const toaster = useToaster();
        const account = new Account();

        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();

        const password = ref("");

        // Remember encryption key
        const rememberEncryptionKey = async () => {
            // If we can decrypt the encrypted master key, then we can save this encryption key
            try {
                const salt = authenticationStore.getPasswordSalt;
                const decryptedMasterKey = await account.decryptMasterKey(password.value, salt!, encryptionKeyStore.getEncryptedMasterKey);

                if (decryptedMasterKey) {
                    // Derive the stretched key used to encrypt the master key and save it
                    const stretchedKey = await account.deriveStretchedPassword(password.value, salt!);
                    encryptionKeyStore.setStretchedPassword(stretchedKey.key, true);
                }
            } catch (e) {
                return toaster.error(e);
            }
        }

        return {
            password,

            rememberEncryptionKey
        };
    },
});
</script>