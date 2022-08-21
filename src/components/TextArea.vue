<template>
<textarea :value="modelValue" @input="updateValue" :placeholder="placeholder"
        class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-mountain-meadow focus:border-mountain-meadow block w-full p-2 h-20 transition" /> 
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: "TextArea",
    props: {
        modelValue: {
            type: String
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