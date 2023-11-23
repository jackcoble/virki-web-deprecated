<template>
    <div class="fixed z-50" :style="{ left: x + 'px', top: y + 'px' }" ref="contextMenu">
        <div class="p-1">
            <div id="dropdown"
                class="bg-white rounded-lg shadow w-44">
                <ul v-for="action in actions" :key="action.name" class="py-2 text-xs text-gray-700" aria-labelledby="dropdownDefaultButton">
                    <li>
                        <button class="w-full text-left block px-4 py-2 hover:bg-gray-100" @click="emitEvent(action.emits)">{{ action.name }}</button>
                    </li>
                </ul>
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

// Emit close context menu event when clicking outside
onClickOutside(contextMenu, (() => {
    emit("close-menu");
}));

// Emits a specified action
const emitEvent = (event: string) => {
    emit(event);
}
</script>