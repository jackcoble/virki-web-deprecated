<template>
    <!-- Vault currently active -->
    <h2 class="text-2xl font-semibold text-gray-900 cursor-pointer" @click="showModal = !showModal">
        {{ vaultStore.getActiveVault ? vaultStore.getActiveVault.name : 'No vault found...' }}
    </h2>

    <BaseModal :show="showModal" @done="updateActiveVault" @close="showModal = !showModal" doneFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Vault Selector</h1>
                <p class="text-xs">
                    Quickly switch between the different vaults for your authentication tokens.
                </p>

                <fieldset class="h-48 w-full p-2 overflow-auto">
                    <div class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                        <div v-for="(vault) in vaultStore.getVaults" :key="vault.id" class="relative flex items-start py-3" @click="selectedVault = vault.id!">
                            <div class="mr-3 flex items-center h-5">
                                <input type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" :checked="vault.id === selectedVault" />
                            </div>
                            <div class="min-w-0 flex-1 text-sm">
                                <label class="font-medium text-gray-700 select-none">{{ vault.name }}</label>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useVaultStore } from "@/stores/vaultStore";
import type { EncryptedVault } from "@/models/vault";

export default defineComponent({
    components: {
        BaseModal,
    },
    setup() {
        const vaultStore = useVaultStore();

        // Ref controlling whether modal should be shown or not
        const showModal = ref(false);
        const selectedVault = ref(vaultStore.getActiveVaultId);

        // Update active vault (gets triggered when we receive the 'done' event)
        const updateActiveVault = () => {
            vaultStore.setActiveVault(selectedVault.value);
            showModal.value = !showModal.value;
        }

        return {
            showModal,
            selectedVault,
            vaultStore,

            updateActiveVault
        }
    },
});
</script>