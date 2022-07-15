<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Create vault</h2>

            <!-- Vault icon/image upload -->
            <input class="hidden" type="file" accept="image/*" @change="handleImage" ref="iconInput" />
            <div class="ml-7 object-contain rounded-full w-24 h-24 p-7 bg-gray-200 cursor-pointer" @click="triggerFileUploadPrompt">
                <PhotographIcon class="text-gray-500 rounded-full" />
            </div>

            <img :src="uploadedIcon" alt="Uploaded image">
        </div>
    </div>
</template>

<script lang="ts">
import useToaster from "@/composables/useToaster";
import { defineComponent, ref } from "vue";

import { PhotographIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "NewVault",
    components: {
        PhotographIcon
    },
    setup() {
        const toaster = useToaster();

        const iconInput = ref();
        const uploadedIcon = ref(""); // Stores Base64 encoded image/icon

        // Function to trigger hidden input prompt
        const triggerFileUploadPrompt = () => {
            if (iconInput.value) {
                iconInput.value.click();
            }
        }

        // Function to receive file upload event
        // (would like to use a type here, but we're feeling risky with any)
        const handleImage = (e: any) => {
            // Get the file from the event and check its size
            const maximumFileSizeBytes = 1 * 1024 * 1024; // 1MB
            const selectedImage = e.target.files[0] as Blob;
            if (selectedImage.size > maximumFileSizeBytes) {
                return toaster.error("Uploaded image is too big!");
            }

            // Read the file into a FileReader as Data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedIcon.value = e.target?.result as string;
            }

            reader.readAsDataURL(selectedImage);
        }

        return {
            iconInput,
            uploadedIcon,

            triggerFileUploadPrompt,
            handleImage
        }
    }
})
</script>