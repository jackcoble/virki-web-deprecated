<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Create vault</h2>

            <!-- Vault icon/image upload -->
            <input type="file"
                id="avatar" name="avatar"
                accept="image/png, image/jpeg"
                @change="handleImage"
            />

            <img :src="uploadedIcon" alt="Uploaded image">
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
    name: "NewVault",
    setup() {
        const uploadedIcon = ref(""); // Stores Base64 encoded image/icon

        // Function to receive file upload event
        // (would like to use a type here, but we're feeling risky with any)
        const handleImage = (e: any) => {
            // Get the file from the event
            const selectedImage = e.target.files[0];

            // Read the file into a FileReader as Data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedIcon.value = e.target?.result as string;
            }

            reader.readAsDataURL(selectedImage);
        }

        return {
            uploadedIcon,

            handleImage
        }
    }
})
</script>