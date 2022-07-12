<template>
    <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
        <button @click.prevent="ok" type="button"
            class="w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-400 focus:outline-none sm:text-sm">
            OK
        </button>

        <button @click.prevent="cancel" type="button"
            class="w-full rounded-md border shadow-sm px-4 py-2 text-base font-medium text-gray-900 focus:outline-none sm:text-sm">
            Cancel
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup(props, { emit }) {
        const ok = () => {
            emit("ok");
        };

        const cancel = () => {
            emit("cancel");
        };

        return {
            ok,
            cancel,
        };
    },
});
</script>
