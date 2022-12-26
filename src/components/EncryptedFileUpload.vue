<template>
    <div class="flex items-center justify-center p-2 rounded-full bg-gray-100 border-2 border-gray-200 cursor-pointer w-24 h-24" @click="triggerUploadInput">
        <input class="hidden" type="file" accept="image/*" ref="uploadInput" />
        <UploadIcon class="text-gray-400 w-10 h-10" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { UploadIcon } from '@heroicons/vue/solid';

export default defineComponent({
    name: "EncryptedFileUpload",
    props: {
        encryptionKey: {
            type: String,
            required: true
        }
    },
    emits: ['objectKey', 'error'],
    components: {
        UploadIcon
    },
    setup() {
        const uploadInput = ref();

        // Triggers the input element by clicking it
        const triggerUploadInput = () => {
            if (uploadInput.value) {
                uploadInput.value.click();
            }
        }

        return {
            uploadInput,

            triggerUploadInput
        }
    }
})
</script>