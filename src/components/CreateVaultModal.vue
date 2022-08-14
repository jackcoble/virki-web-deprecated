<template>
    <BaseModal okFooter @ok="createVault">
        <template v-slot:body>
            <div class="space-y-3">
                <h1 class="text-xl text-center">Create a vault</h1>
                <p class="text-sm text-center">Make a new vault to store and organise your authentication tokens</p>

                <!-- Icon -->
                <div class="flex justify-center">
                    <IconUpload :image="icon" @imageData="handleImageData"  />
                </div>
               
                <!-- Name -->
                <div class="space-y-1">
                    <p class="font-bold text-sm">Name</p>
                    <b-input type="text" v-model="name" placeholder="A name for your vault" />
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
import type { Vault } from "@/models/vault";

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
    setup(props, { emit }) {
        const account = useAccount();
        const vault = useVault();

        const encryptionKeyStore = useEncryptionKeyStore();
        const vaultStore = useVaultStore();
        const pouchDB = usePouchDB();

        const activeVault = computed(() => vaultStore.getActiveVault);
        const activeVaultName = computed(() => vaultStore.getActiveVault?.name);
        
        const name = ref("");
        const description = ref("");
        const icon = ref("");

        // Function to handle the "imageData" event from icon upload component
        const handleImageData = (e: any) => {
            // If the event is undefined, that means
            // the image has been cleared, so we want to remove the icon from this vault.
            if (!e) {
                icon.value = "";
            }
            else {
                // Update icon from the string in the event
                icon.value = e;
            }
        }

        // Function to handle creating a new encrypted vault
        const createVault = async () => {
            if (!account || !vault) {
                return;
            }

            // Prepare a payload as to what the data should look in decrypted format...
            // Description and Icon are optional so set them later if available
            const vaultDetails = {
                name: name.value,
                description: description.value ? description.value : null,
                icon: icon.value ? icon.value : null
            } as Vault;
                    
            // Now that we have the vault payload prepared, we can encrypt it and
            // save to PouchDB.
            const masterKeyPair = encryptionKeyStore.getMasterKeyPair;
            const encryptedVault = await vault.createEncryptedVaultObject(vaultDetails, masterKeyPair.private_key, masterKeyPair.public_key);
            await pouchDB.addVault(encryptedVault)

            // Decrypt the vault we just created, and then set the active vault + add to store
            const decryptedVault = await vault.decryptFromVaultObject(encryptedVault, masterKeyPair.private_key, masterKeyPair.public_key);
            vaultStore.setActiveVault(decryptedVault._id);
            vaultStore.add(decryptedVault);

            emit("close");
        }

        return {
            name,
            description,
            icon,

            activeVaultName,
            activeVault,

            createVault,
            handleImageData
        }
    }
});
</script>