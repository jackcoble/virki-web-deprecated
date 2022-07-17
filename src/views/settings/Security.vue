<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Security</h2>

            <!-- Save encryption key to device -->
            <p class="text-sm">It can be inconvenient having to enter your password every time you launch Authoriser in order to decrypt your vaults. If
                you wish though, you can configure <span class="font-bold">this device only</span> to remember your encryption key.</p>

            <p class="text-sm">Usually we do not recommend this, but if your device is protected via a form of biometric security, enabling this option could save you some time when launching Authoriser.</p>
        
            <RememberEncryptionKeyModal :show="showRememberEncryptionKeyModal" @ok="checkEncryptionKeyIsSet" @cancel="showRememberEncryptionKeyModal = !showRememberEncryptionKeyModal" />
            <b-button @click="handleRememberEncryptionKey" :classType="encryptionKeyExists ? 'danger' : 'primary'">
                {{ encryptionKeyExists ? 'Remove encryption key' : 'Remember encryption key' }}
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue"
import RememberEncryptionKeyModal from "../../components/RememberEncryptionKeyModal.vue"

export default defineComponent({
    name: "Settings",
    setup() {
        const showRememberEncryptionKeyModal = ref(false);
        const encryptionKeyExists = ref(false);

        onMounted(() => {
            // Check when page loads if the encryption key already exists
            const encryptionKey = localStorage.getItem("stretched_password");
            if (encryptionKey) {
                encryptionKeyExists.value = true;
            }
        })

        // Function to determine whether remember encryption key modal needs to be shown
        const handleRememberEncryptionKey = () => {
            // If we've already got an encryption key, we want to remove it
            if (encryptionKeyExists.value) {
                localStorage.removeItem("stretched_password");
                encryptionKeyExists.value = false;

                return;
            }
            
            // Otherwise show the modal
            showRememberEncryptionKeyModal.value = !showRememberEncryptionKeyModal.value;
        };

        // When we receive the OK event, we want to check if the encryption key has been set
        const checkEncryptionKeyIsSet = () => {
            const encryptionKey = localStorage.getItem("stretched_password");
            if (encryptionKey) {
                encryptionKeyExists.value = true;
                showRememberEncryptionKeyModal.value = !showRememberEncryptionKeyModal.value;
            }
        }

        return {
            encryptionKeyExists,
            showRememberEncryptionKeyModal,

            handleRememberEncryptionKey,
            checkEncryptionKeyIsSet
        };
    },
    components: { RememberEncryptionKeyModal }
})
</script>