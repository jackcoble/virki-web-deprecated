<template>
    <div class="flex">
        <div class="flex-row flex-grow">
            <input :type="showPassword ? 'text' : 'password'" :value="modelValue" @input="updateValue" :placeholder="placeholder"
            class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2 h-10">

            <password-strength v-if="showStrength" class="mt-1" :password="modelValue" />
        </div>

        <div class="flex-col items-center justify-center">
            <button type="button" class="m-2 w-5 text-purple-800" @click="showPassword = !showPassword">
            <EyeOffIcon v-if="showPassword" />
            <EyeIcon v-if="!showPassword" />
        </button>
        </div>
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