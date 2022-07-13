<template>
    <button
        :disabled="loading"
        class="w-full rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:text-sm"
        :class="styles[classType]"
    >
        <slot v-if="!loading">Button</slot>
        <svg
            v-else
            class="animate-spin mx-auto h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
            />
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Button",
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false,
        },
        // "classType" sets the class to be used on the button
        classType: {
            type: String,
            default: "primary"
        }
    },
    setup() {
        // Define a dictionary of classes to be applied to the button
        const styles: Record<string, string> = {
            "primary": "bg-purple-800 text-white hover:bg-purple-600",
            "danger": "bg-red-400 text-red-900 hover:bg-red-300 hover:text-red-700",
            "light": "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-500 border-gray-200"
        };

        return {
            styles
        }
    }
});
</script>