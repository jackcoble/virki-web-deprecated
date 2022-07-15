<template>
    <!-- Vault currently active -->
    <div class="flex flex-row items-center space-x-2">
        <div class="object-contain cursor-pointer rounded-full w-10" :class="[vaultStore.getActiveVault?.icon ? 'rounded-full' : 'bg-gray-200 p-1.5']" @click="showModal = !showModal">
            <ClockIcon v-if="!vaultStore.getActiveVault?.icon" class="text-purple-800" />
            <img v-else class="rounded-full" :src="vaultStore.getActiveVault?.icon" alt="Vault Icon">
        </div>

        <h2 class="text-2xl font-semibold text-gray-900">
            {{ vaultStore.getActiveVault ? vaultStore.getActiveVault.name : 'No vault found...' }}
        </h2>
    </div>

    <BaseModal :show="showModal" @done="updateActiveVault" @close="showModal = !showModal" doneFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Change Vault</h1>
                <p class="text-xs">
                    Quickly switch between the different vaults for your authentication tokens.
                </p>

                <fieldset class="h-48 w-full p-2 overflow-auto">
                    <div class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                        <div v-for="(vault) in vaultStore.getVaults" :key="vault.id" class="relative flex items-start py-3 cursor-pointer" @click="selectedVault = vault.id!">
                            <div class="mr-3 flex items-center space-x-3 w-full text-sm">
                                <input type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" :checked="vault.id === selectedVault" />

                                <div class="object-contain rounded-full w-8">
                                    <KeyIcon v-if="!vault.icon" class="text-purple-800 bg-red-500 rounded-full" />
                                    <img v-else class="rounded-full" :src="vault.icon" alt="Vault Icon">
                                </div>

                                <p class="font-medium text-gray-700 select-none">{{ vault.name }}</p>
                            </div>
                        </div>

                        <!-- Add new vault -->
                        <div class="flex flex-row items-center w-100 text-sm h-14 space-x-3 cursor-pointer">
                            <div class="ml-7 object-contain rounded-full w-8 h-8 p-1.5 bg-gray-200">
                                <PlusIcon class="text-gray-500 rounded-full" />
                            </div>
                            <p class="font-medium text-gray-700 select-none">Create a new vault</p>
                        </div>
                    </div>
                </fieldset>
            </div>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseModal from "@/components/Modal/BaseModal.vue";
import { useVaultStore } from "@/stores/vaultStore";

import { ClockIcon, KeyIcon, PlusIcon } from "@heroicons/vue/outline";

export default defineComponent({
    components: {
        BaseModal,
        ClockIcon,
        KeyIcon,
        PlusIcon
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