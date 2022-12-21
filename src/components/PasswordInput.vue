<template>
    <div class="flex justify-between items-center space-x-1">
        <b-input :type="showPassword ? 'text' : 'password'" :value="modelValue" @input="updateValue"
            :placeholder="placeholder"
            required
        />
        
        <button @click="showPassword = !showPassword"
            class="text-mountain-meadow bottom cursor-pointer border bg-gray-100 border-gray-300 rounded p-2">
            <EyeOffIcon class="w-5" v-if="showPassword" />
            <EyeIcon class="w-5" v-if="!showPassword" />
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { EyeIcon, EyeOffIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "Input",
    components: {
        EyeIcon,
        EyeOffIcon
    },
    props: {
        modelValue: {
            type: String
        },

        placeholder: {
            type: String
        },

        showStrength: {
            type: Boolean,
            default: false
        }
    },
    setup(props, context) {
        // Ref to maintain state of whether to show password or not
        const showPassword = ref(false);

        // Emit update value when input is changed
        const updateValue = (event: any) => {
            context.emit("update:modelValue", event.target.value)
        }

        return {
            showPassword,

            updateValue
        }
    }
})
</script>