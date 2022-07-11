<template>
    <div class="h-screen p-4 bg-[#262727] space-y-3">
        <h2 class="text-2xl font-semibold text-white">Settings</h2>

        <!-- Deauthorise sessions -->
        <button class="p-3 w-full rounded bg-red-400 text-red-900 hover:bg-red-300 hover:text-red-700">
            De-authorise sessions
        </button>
              
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Settings"
})
</script>