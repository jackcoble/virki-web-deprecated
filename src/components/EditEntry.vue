<template>
    <div class="flex justify-between items-center px-4">
        <p>Edit an entry</p>

        <button class="p-2">
            <XIcon class="w-6 text-red-400" />
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { XIcon } from "@heroicons/vue/outline"

export default defineComponent({
    name: "EditEntry",
    components: {
        XIcon
    },
    setup() {
    }
})
</script>