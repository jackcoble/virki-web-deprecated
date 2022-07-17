<template>
    <BaseModal :show="show" okFooter @ok="handleRename">
        <template v-slot:body>
            <div class="space-y-3">
                <h1 class="text-xl text-center">Edit your vault</h1>
                <p class="text-sm text-center">Make changes to your vault name, description and icon.</p>

                <!-- Icon -->
                <div class="flex justify-center">
                    <IconUpload :image="activeVault?.icon" @image-data="handleImageData" />
                </div>
               
                <!-- Name -->
                <div class="space-y-1">
                    <p class="font-bold text-sm">Name</p>
                    <b-input type="text" v-model="name" :placeholder="activeVaultName" />
                </div>
               
                <!-- Description -->
                <div class="space-y-1">
                    <p class="font-bold text-sm">Description</p>
                    <textarea v-model="description" :placeholder="activeVault?.description" rows="4" placeholder="A description of what you'll store in this vault" class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2" />
                </div>
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useVaultStore } from "@/stores/vaultStore";
import type { IVault } from "@/class/vault";
import useAccount from "@/composables/useAccount";
import useVault from "@/composables/useVault";
import { useApplicationStore } from "@/stores/appStore";
import IconUpload from "./IconUpload.vue";
import { es } from "date-fns/locale";

export default defineComponent({
    name: "RenameVaultModal",
    components: {
    BaseModal,
    IconUpload
},
    props: {
        show: {
            type: Boolean,
        },
    },
    setup() {
        const account = useAccount();
        const vault = useVault();

        const applicationStore = useApplicationStore();
        const vaultStore = useVaultStore();
        
        const name = ref("");
        const description = ref("");
        const icon = ref("");

        const activeVault = computed(() => vaultStore.getActiveVault);
        const activeVaultName = computed(() => vaultStore.getActiveVault?.name);

        // Function to handle re-encryption of vault data with updated name
        const handleRename = async () => {
            // If new vault name is empty, just close the modal
            if (!name.value || !account) {
                return;
            }

            // Otherwise we can construct an updated Vault payload using existing data.
            // We only want to update the name, description and icon at most as this is all the user has control over.
            const activeVault = vaultStore.getActiveVault as IVault;
            if (activeVault) {
                const modifiedVault = { ...activeVault };

                // Update vault name, description and icon
                modifiedVault.name = name.value;
                modifiedVault.description = description.value;
                modifiedVault.icon = icon.value;

                // Re-encrypt the active vault with the new data, and save it to IndexedDB
                const encryptedActiveVault = await vault?.createEncryptedVaultObject(modifiedVault, !applicationStore.isOnline);
                await vault?.saveToDB(encryptedActiveVault!);

                // Decrypt it and then update in vault store
                const decryptedActiveVault = await vault?.decryptFromVaultObject(encryptedActiveVault!);
                vaultStore.add(decryptedActiveVault!);
            }
        }

        // Function to handle the "imageData" event from icon upload component
        const handleImageData = (e: any) => {
            // If the event is undefined, that means
            // the image has been cleared, so do that with our icon
            if (!e) {
                icon.value = "";
            }
            else {
                // Update icon from the string in the event
                icon.value = e;
            }
        }

        return {
            name,
            description,
            icon,

            activeVaultName,
            activeVault,

            handleRename,
            handleImageData
        }
    }
});
</script>