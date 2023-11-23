<template>
    <div class="fixed z-50" :style="{ left: x + 'px', top: y + 'px' }" ref="contextMenu">
        <div class="bg-white w-48 border border-gray-300 rounded-lg flex flex-col text-sm py-2 px-2 space-y-1 text-gray-500 shadow-lg">
            <div v-for="action in actions" :key="action.name" @click="emitEvent(action.emits)" class="flex hover:bg-gray-100 py-1 px-2 rounded">
                <div>{{ action.name }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { onClickOutside } from "@vueuse/core"

const emit = defineEmits();
const contextMenu = ref(null);

const { x, y, actions } = defineProps<{
    x: number;
    y: number;
    actions: any[]
}>();

// Emit an action to close context menu
onClickOutside(contextMenu, (() => {
    emit("action", "close-menu");
}));

// Emits a specified action
const emitEvent = (event: string) => {
    emit("action", event);
}
</script>