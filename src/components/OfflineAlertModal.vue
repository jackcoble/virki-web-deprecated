<template>
    <BaseModal v-if="show" doneFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Your device is offline!</h1>
                <p class="text-sm">
                    Don't worry though - any changes you make will be synced back to our servers when you're connected again!
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