<template>
    <BaseModal @ok="rememberEncryptionKey" okFooter>
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
import { Crypto } from "@/class/crypto";

export default defineComponent({
    components: {
        BaseModal,
    },
    props: {
        show: {
            type: Boolean,
        },
    },
    setup(props, { emit }) {
        const toaster = useToaster();
        const account = new Account();

        const authenticationStore = useAuthenticationStore();
        const encryptionKeyStore = useEncryptionKeyStore();

        const password = ref("");

        // Remember encryption key
        const rememberEncryptionKey = async () => {
            try {
                // Derive stretched password
                const salt = authenticationStore.getPassword.salt;
                const stretched = await account.deriveStretchedPassword(password.value, salt);

                // If we're able to decrypt the encrypted master keypair with the stretched password,
                // then the password was correct and we can store it.
                const encryptedMasterKeypair = encryptionKeyStore.getEncryptedMasterKey;
                const decryptedMasterPrivateKey = await Crypto.decrypt(encryptedMasterKeypair.private_key, await Crypto.fromBase64(stretched.key));

                if (decryptedMasterPrivateKey) {
                    encryptionKeyStore.setStretchedPassword(stretched.key, true);
                    emit("ok")
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