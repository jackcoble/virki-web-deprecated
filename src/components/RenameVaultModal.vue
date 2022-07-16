<template>
    <BaseModal :show="show" okFooter @ok="handleRename">
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Rename your vault</h1>
                <p class="text-sm">
                    Enter a new name for your vault below.
                </p>

                <b-input type="text" v-model="vaultName" :placeholder="activeVaultName" />
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useVaultStore } from "@/stores/vaultStore";
import type { DecryptedVault, EncryptedVault } from "@/class/vault";
import useAccount from "@/composables/useAccount";
import vaultService from "@/service/api/vaultService";
import useVault from "@/composables/useVault";

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
            const activeVault = vaultStore.getActiveVault;
            if (activeVault) {
                const modifiedVault: DecryptedVault = {
                    name: vaultName.value,
                    description: activeVault.description,
                    icon: activeVault.icon
                }

                // Create an encrypted object of the vault data, and set the IDs for both the modified + encrypted before sending to API.
                const encryptedVault = await vault?.createEncryptedVaultObject(modifiedVault);
                modifiedVault.id = activeVault.id;
                encryptedVault!.id = activeVault.id!;

                try {
                    await vaultService.UpdateVault(encryptedVault!).then(res => {
                        const response = res.data as EncryptedVault;

                        // Need to set UID and Created date again before inserting to IndexedDB
                        encryptedVault!.uid = response.uid;
                        encryptedVault!.created = response.created;
                    })
                } catch (e) {
                    // TODO: Handle
                    console.log(e);
                }

                // Insert into IndexedDB and update the store
                await vault?.saveToDB(encryptedVault!);
                vaultStore.add(modifiedVault);
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