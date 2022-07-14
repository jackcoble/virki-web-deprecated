<template>
    <div class="flex">
        <input :type="showPassword ? 'text' : 'password'" :value="modelValue" @input="updateValue" :placeholder="placeholder"
            class="border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2"
            :class="showPassword && modelValue ? 'font-mono' : 'font-sans'"
        >

        <button type="button" class="m-2 w-5 text-purple-800" @click="showPassword = !showPassword">
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