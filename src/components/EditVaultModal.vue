<template>
    <BaseModal okFooter @ok="handleRename">
        <template v-slot:body>
            <div class="space-y-3">
                <h1 class="text-xl text-center">Edit your vault</h1>
                <p class="text-sm text-center">Make changes to your vault name, description and icon.</p>

                <!-- Icon -->
                <div class="flex justify-center">
                    <IconUpload :image="icon" @image-data="handleImageData" />
                </div>
               
                <!-- Name -->
                <div class="space-y-1">
                    <p class="font-bold text-sm">Name</p>
                    <b-input type="text" v-model="name" />
                </div>
               
                <!-- Description -->
                <div class="space-y-1">
                    <p class="font-bold text-sm">Description</p>
                    <textarea v-model="description" rows="4" placeholder="A description of what you'll store in this vault" class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2" />
                </div>
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useVaultStore } from "@/stores/vaultStore";
import useAccount from "@/composables/useAccount";
import useVault from "@/composables/useVault";
import IconUpload from "./IconUpload.vue";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import usePouchDB from "@/composables/usePouchDB";

export default defineComponent({
    name: "EditVaultModal",
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

        const encryptionKeyStore = useEncryptionKeyStore();
        const vaultStore = useVaultStore();
        const pouchDB = usePouchDB();

        const activeVault = computed(() => vaultStore.getActiveVault);
        const activeVaultName = computed(() => vaultStore.getActiveVault?.name);
        
        const name = ref(activeVault.value?.name ? activeVault.value?.name : "");
        const description = ref(activeVault.value?.description ? activeVault.value?.description : "");
        const icon = ref(activeVault.value?.icon ? activeVault.value?.icon : "");
        const removeIcon = ref(false);

        // Function to handle the "imageData" event from icon upload component
        const handleImageData = (e: any) => {
            // If the event is undefined, that means
            // the image has been cleared, so we want to remove the icon from this vault.
            if (!e) {
                removeIcon.value = true;
                icon.value = "";
            }
            else {
                // Update icon from the string in the event
                removeIcon.value = false;
                icon.value = e;
            }
        }

        // Function to handle re-encryption of vault data that has been updated
        const handleRename = async () => {
            if (!account || !vault) {
                return;
            }

            // Otherwise we can construct an updated Vault payload using existing data.
            // We only want to update the name, description and icon at most as this is all the user has control over.
            const activeVault = vaultStore.getActiveVault as IVault;
            if (activeVault) {
                const modifiedVault = { ...activeVault };

                // Determine the icon we want to use
                if (removeIcon.value === true) {
                    // Remove the icon entirely
                    icon.value = "";
                }

                // Reset removeIcon value
                removeIcon.value = false;

                // Update vault name, description and icon
                modifiedVault.name = name.value ? name.value : activeVault.name;
                modifiedVault.description = description.value;
                modifiedVault.icon = icon.value;

                // Re-encrypt the active vault with the new data, and save it in PouchDB.
                const keypair = encryptionKeyStore.getMasterKeyPair;
                const encryptedActiveVault = await vault.createEncryptedVaultObject(modifiedVault, keypair.privateKey, keypair.publicKey);
                await pouchDB.addVault(encryptedActiveVault);

                // Decrypt it and then update in vault store
                const decryptedActiveVault = await vault.decryptFromVaultObject(encryptedActiveVault, keypair.privateKey, keypair.publicKey);
                vaultStore.add(decryptedActiveVault);
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