<template>
    <div class="relative">
        <b-input :type="showPassword ? 'text' : 'password'" :value="modelValue" @input="updateValue"
            :placeholder="placeholder"
            required
        />
        
        <button @click="showPassword = !showPassword"
            class="text-mountain-meadow absolute bottom w-5 h-5 bottom-2.5 right-2.5">
            <EyeOffIcon v-if="showPassword" />
            <EyeIcon v-if="!showPassword" />
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