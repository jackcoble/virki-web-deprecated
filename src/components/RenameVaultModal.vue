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
import type { EncryptedVault } from "@/models/vault";
import useAccount from "@/composables/useAccount";
import type { IVaultDB } from "@/class/db";
import vault from "@/service/api/vault";

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
        const vaultStore = useVaultStore();
        
        const vaultName = ref("");
        const activeVaultName = computed(() => vaultStore.getActiveVault?.name);

        // Function to handle re-encryption of vault data with updated name
        const handleRename = async () => {
            // If new vault name is empty, just close the modal
            if (!vaultName.value || !account) {
                return;
            }

            // Otherwise we can construct an updated Vault payload using existing data
            const activeVault = vaultStore.getActiveVault;
            const modifiedVault: EncryptedVault = {
                name: vaultName.value,
                description: activeVault?.description!,
                icon: activeVault?.icon!
            }

            const vaultString = JSON.stringify(modifiedVault);
            const encryptedVaultString = await account.encryptData(vaultString);

            // Send the encrypted Vault string to the API
            const res = await vault.UpdateVault(activeVault!.id!, encryptedVaultString);
            if (res && res.data) {
                const vault = res.data;

                // Decrypt the returned response and update IndexedDB + Store
                const decryptedVaultString = await account.decryptData(vault.data);
                const decryptedVault = JSON.parse(decryptedVaultString) as EncryptedVault;
                decryptedVault.id = vault.id;

                // For good measure we should put this in IndexedDB too (just in case data has updated at all!)
                await account.addVaultToDB(vault);

                // Then we can add/update the store
                vaultStore.add(decryptedVault);
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