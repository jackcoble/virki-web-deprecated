<template>
    <input :type="type" :value="modelValue" @input="updateValue" :placeholder="placeholder"
        class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2 h-10">
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Input",

    props: {
        modelValue: {
            type: String
        },

        type: {
            type: String,
            default: "text"
        },

        placeholder: {
            type: String
        }
    },
    setup(props, context) {
        // Emit update value when input is changed
        const updateValue = (event: any) => {
            context.emit("update:modelValue", event.target.value)
        }

        return {
            updateValue
        }
    }
})
</script>