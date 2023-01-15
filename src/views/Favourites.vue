<template>
    <div class="flex flex-col h-full p-4">
        <!-- Show frowny face if we've got no tokens, but have vaults available -->
        <div class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
            <StarIcon class="w-12 text-yellow-500" />
            <p class="text-sm">You have no favourites just yet!</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { StarIcon } from "@heroicons/vue/outline"

export default defineComponent({
    name: "Favourties",
    components: {
        StarIcon
    }

})
</script>