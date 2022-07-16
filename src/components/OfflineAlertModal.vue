<template>
    <BaseModal :show="show" doneFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Your device is offline!</h1>
                <p class="text-sm">
                    In offline mode, you won't be able to make any modifications to your vaults, but you can still access your authentication tokens.
                </p>
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";

export default defineComponent({
    components: {
        BaseModal,
    },
    props: {
        show: {
            type: Boolean,
        },
    }
});
</script>