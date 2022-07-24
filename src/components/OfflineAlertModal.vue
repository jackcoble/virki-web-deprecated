<template>
    <BaseModal v-if="show" doneFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <StatusOfflineIcon class="w-16 h-16 mx-auto text-red-400 p-3.5 rounded-full bg-gray-100" />
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
import { StatusOfflineIcon } from "@heroicons/vue/outline";

export default defineComponent({
    components: {
        BaseModal,
        StatusOfflineIcon
    },
    props: {
        show: {
            type: Boolean,
        },
    }
});
</script>