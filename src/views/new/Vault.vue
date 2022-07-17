<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Create vault</h2>

            <!-- Vault icon/image upload -->
            <div class="flex justify-center pt-8">
                <input class="hidden" type="file" accept="image/*" @change="handleImage" ref="iconInput" />
                <div class="rounded-full bg-gray-200 border-2 border-gray-300 cursor-pointer" @click="triggerFileUploadPrompt">
                    <PhotographIcon v-if="!uploadedIcon" class="text-gray-500 rounded-full w-24 p-4" />
                    <img v-else class="rounded-full object-cover w-24 h-24" :src="uploadedIcon" alt="Uploaded Icon">
                </div>
            </div>
            <p class="text-xs text-center text-gray-600">Upload a vault icon (1MB maximum)</p>

            <div class="space-y-2">
                <!-- Vault name -->
                <p class="font-bold text-sm pt-2">Name</p>
                <b-input type="text" placeholder="Vault name" v-model="name" />

                <!-- Vault description -->
                <p class="font-bold text-sm pt-2">Description</p>
                <textarea v-model="description" rows="4" placeholder="A description of what you'll store in this vault" class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2" />
            
                <!-- Submit button -->
                <b-button @click="createVault" :loading="isLoading">Submit</b-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import useToaster from "@/composables/useToaster";
import { defineComponent, ref } from "vue";

import { PhotographIcon } from "@heroicons/vue/outline";
import useAccount from "@/composables/useAccount";
import { useVaultStore } from "@/stores/vaultStore";
import { useRouter } from "vue-router";
import useVault from "@/composables/useVault";
import type { IVault } from "@/class/vault";
import { useApplicationStore } from "@/stores/appStore";

export default defineComponent({
    name: "NewVault",
    components: {
        PhotographIcon
    },
    setup() {
        const account = useAccount();
        const vault = useVault();

        const toaster = useToaster();
        const router = useRouter();

        const applicationStore = useApplicationStore();
        const vaultStore = useVaultStore();

        const iconInput = ref();
        const uploadedIcon = ref(""); // Stores Base64 encoded image/icon

        const name = ref("");
        const description = ref("");

        const isLoading = ref(false);

        // Function to trigger hidden input prompt
        const triggerFileUploadPrompt = () => {
            // If we already have an uploadedIcon,
            // assume the user wants to clear the upload
            if (uploadedIcon.value) {
                uploadedIcon.value = "";
                return;
            }

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

        // Function to construct a vault entry, encrypt it,
        // send to API, and update active vault
        const createVault = async () => {
            // Check that account has been initialised before trying to use it
            if (!account) {
                return toaster.error("Account has not been initialised.");
            }

            isLoading.value = true;

            try {
                // Prepare a payload as to what the data should look in decrypted format...
                // Description and Icon are optional so set them later if available
                const vaultDetails = {
                    name: name.value
                } as IVault;

                if (description.value.trim().length > 0) {
                    vaultDetails.description = description.value;
                }

                if (uploadedIcon.value.trim().length > 0) {
                    vaultDetails.icon = uploadedIcon.value;
                }
                        
                // Now that we have the vault payload prepared, we can encrypt it and
                // save to IndexedDB, and submit to our API (if we're online).
                const encryptedVault = await vault?.createEncryptedVaultObject(vaultDetails, !applicationStore.isOnline);
                if (encryptedVault) {
                    await vault?.saveToDB(encryptedVault);

                    if (applicationStore.isOnline) {
                        // Send to API...
                        // TODO
                        console.log("Send encrypted vault to API!")
                    }

                    // Decrypt the vault we just created, and then set the active vault + add to store
                    const decryptedVault = await vault?.decryptFromVaultObject(encryptedVault);
                    vaultStore.setActiveVault(decryptedVault!.v_id);
                    vaultStore.add(decryptedVault!)

                    // Push to Index
                    router.push("/");
                }

                
            } catch (e) {
                return toaster.error("There was an error creating your vault.");
            } finally {
                isLoading.value = false;
            }
        }

        return {
            iconInput,
            uploadedIcon,

            name,
            description,

            isLoading,

            triggerFileUploadPrompt,
            handleImage,
            createVault
        }
    }
})
</script>