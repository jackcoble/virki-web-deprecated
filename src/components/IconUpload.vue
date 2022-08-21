<template>
    <div class="flex flex-grow-0 items-center justify-center rounded-full bg-gray-200 border-2 border-gray-200 w-24 h-24 cursor-pointer" @click="triggerFileUploadPrompt">
        <input class="hidden" type="file" accept="image/*" @change="handleImage" ref="iconInput" />
        <PhotographIcon v-if="!uploadedIcon" class="text-gray-500 rounded-full w-24 p-4" />
        <img v-if="uploadedIcon" class="rounded-full object-cover w-24 h-24" :src="uploadedIcon" alt="Uploaded Icon">
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import useToaster from "@/composables/useToaster";
import { PhotographIcon } from "@heroicons/vue/outline";

export default defineComponent({
    name: "IconUpload",
    props: {
        image: {
            type: String
        }
    },
    emits: ["imageData"],
    components: {
        PhotographIcon
    },
    setup(props, { emit }) {
        const toaster = useToaster();

        const iconInput = ref();
        const uploadedIcon = ref(props.image);

        // Function to trigger/click the file upload prompt
        const triggerFileUploadPrompt = () => {
            // If we already have an uploadedIcon,
            // assume the user wants to clear the upload
            if (uploadedIcon.value) {
                uploadedIcon.value = "";

                // Emit updated data URL (empty) so our parent can handle the change
                emit("imageData");

                return;
            }
            if (iconInput.value) {
                iconInput.value.click();
            }
        }

        // Image upload handler function that emits the data URL in an event
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

                // Emit the data URL in the event
                emit("imageData", uploadedIcon.value)
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