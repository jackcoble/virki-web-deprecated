<template>
    <!-- Vault currently active -->
    <button @click="showModal = !showModal"
        class="rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
        Personal
    </button>

    <BaseModal :show="showModal" okFooter>
        <div class="space-y-2">
            <h1 class="text-xl text-center">Vault Selector</h1>
            <p class="text-xs">
                Quickly switch between the different vaults for your authentication tokens.
            </p>

            <fieldset class="h-48 w-full p-2 overflow-auto">
                <div class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                    <div v-for="(vault) in vaults" :key="vault.id" class="relative flex items-start py-3">
                        <div class="mr-3 flex items-center h-5">
                            <input type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" :checked="vault.id === activeVaultId" />
                        </div>
                        <div class="min-w-0 flex-1 text-sm">
                            <label class="font-medium text-gray-700 select-none">{{ vault.name }}</label>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useVaultStore } from "@/stores/vaultStore";

export default defineComponent({
    components: {
        BaseModal,
    },
    setup() {
        const vaultStore = useVaultStore();

        // Ref controlling whether modal should be shown or not
        const showModal = ref(false);

        const activeVaultId = vaultStore.getActiveVaultID;
        const vaults = vaultStore.getVaults;

        return {
            showModal,

            activeVaultId,
            vaults
        }
    },
});
</script>