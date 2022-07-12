<template>
    <div class="h-screen p-4 bg-[#262727] space-y-3">
        <h2 class="text-2xl font-semibold text-white">Settings</h2>

        <!-- Description text -->
        <p class="text-sm text-white">Customise the settings for your Authoriser account. Some of the options here are disastrous, so watch out! 💥</p>

        <!-- Deauthorise sessions -->
        <DeauthoriseModal :show="showDeauthoriseSessionModal" @close="showDeauthoriseSessionModal = false" />
        <button class="p-3 w-full rounded bg-red-400 text-red-900 hover:bg-red-300 hover:text-red-700" @click="showDeauthoriseSessionModal = !showDeauthoriseSessionModal">
            De-authorise sessions
        </button>
              
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

// Custom components
import DeauthoriseModal from "@/components/DeauthoriseModal.vue";

export default defineComponent({
    name: "Settings",
    components: {
        DeauthoriseModal
    },
    setup() {
        const showDeauthoriseSessionModal = ref(false);

        return {
            showDeauthoriseSessionModal
        }
    }
})
</script>