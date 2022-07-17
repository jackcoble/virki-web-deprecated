<template>
    <BaseModal :show="show" okFooter @ok="handleRename">
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Edit your vault</h1>

                <!-- Icon -->
               
                <!-- Name -->
                <b-input type="text" v-model="vaultName" :placeholder="activeVaultName" />

                <!-- Description -->
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

export default defineComponent({
    name: "RenameVaultModal",
    components: {
        BaseModal,
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
        
        const vaultName = ref("");
        const activeVaultName = computed(() => vaultStore.getActiveVault?.name);

        // Function to handle re-encryption of vault data with updated name
        const handleRename = async () => {
            // If new vault name is empty, just close the modal
            if (!vaultName.value || !account) {
                return;
            }

            // Otherwise we can construct an updated Vault payload using existing data.
            // We only want to update the name, description and icon at most as this is all the user has control over.
            const activeVault = vaultStore.getActiveVault as IVault;
            if (activeVault) {
                const modifiedVault = { ...activeVault };

                // Update vault name
                modifiedVault.name = vaultName.value;

                // Re-encrypt the active vault with the new data, and save it to IndexedDB
                const encryptedActiveVault = await vault?.createEncryptedVaultObject(modifiedVault, !applicationStore.isOnline);
                await vault?.saveToDB(encryptedActiveVault!);

                // Decrypt it and then update in vault store
                const decryptedActiveVault = await vault?.decryptFromVaultObject(encryptedActiveVault!);
                vaultStore.add(decryptedActiveVault!);
            }
        }

        return {
            vaultName,
            activeVaultName,

            handleRename
        }
    }
});
</script>