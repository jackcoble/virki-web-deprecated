<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Security</h2>

            <!-- Save encryption key to device -->
            <p class="text-sm">It can be inconvenient having to enter your password every time you launch Authoriser in order to decrypt your vaults. If
                you wish though, you can configure <span class="font-bold">this device only</span> to remember your encryption key.</p>

            <p class="text-sm">Usually we do not recommend this, but if your device is protected via a form of biometric security, enabling this option could save you some time when launching Authoriser.</p>
        
            <RememberEncryptionKeyModal :show="showRememberEncryptionKeyModal" />
            <b-button @click="handleRememberEncryptionKey">Remember encryption key?</b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import RememberEncryptionKeyModal from "../../components/RememberEncryptionKeyModal.vue"

export default defineComponent({
    name: "Settings",
    setup() {
        // Function to determine whether remember encryption key modal needs to be shown
        const showRememberEncryptionKeyModal = ref(false)
        const handleRememberEncryptionKey = () => {
            // If we've already got an encryption key, we want to remove it
            
            // Otherwise show the modal
            showRememberEncryptionKeyModal.value = !showRememberEncryptionKeyModal.value;
        };

        return {
            showRememberEncryptionKeyModal,
            handleRememberEncryptionKey
        };
    },
    components: { RememberEncryptionKeyModal }
})
</script>