<template>
    <!-- Vault currently active -->
    <div class="flex flex-row items-center space-x-2">
        <div class="object-contain cursor-pointer rounded-full w-10" :class="[vaultStore.getActiveVault?.icon ? 'rounded-full' : 'bg-gray-200 p-1.5']" @click="showModal = !showModal">
            <ClockIcon v-if="!vaultStore.getActiveVault?.icon" class="text-gray-500" />
            <img v-else class="rounded-full" :src="vaultStore.getActiveVault?.icon" alt="Vault Icon">
        </div>

        <!-- Active vault title and rename modal -->
        <RenameVaultModal :show="showVaultRenameModal" @close="showVaultRenameModal = false" @ok="showVaultRenameModal = false" />
        <h2 class="text-2xl font-semibold text-gray-900" @click="showRenameVault">
            {{ vaultStore.getActiveVault ? vaultStore.getActiveVault.name : 'No vault found...' }}
        </h2>
    </div>

    <BaseModal :show="showModal" @done="updateActiveVault" @close="showModal = !showModal" doneFooter>
        <template v-slot:body>
            <div class="space-y-2">
                <h1 class="text-xl text-center">Change Vault</h1>
                <p class="text-xs text-center">
                    Switch between the different vaults containing your authentication tokens.
                </p>

                <fieldset class="h-48 w-full p-2 overflow-auto">
                    <div class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                        <div v-for="(vault) in vaultStore.getVaults" :key="vault.v_id" class="relative flex items-start py-3 cursor-pointer" @click="selectedVault = vault.v_id">
                            <div class="mr-3 flex items-center space-x-3 w-full text-sm">
                                <input type="radio" class="h-4 w-4 border-gray-300" :checked="vault.v_id === selectedVault" />

                                <div class="rounded-full bg-gray-200 border-2 border-gray-300">
                                    <div v-if="!vault.icon" class="w-8 h-8 p-1.5 bg-gray-200 rounded-full">
                                        <ClockIcon class="text-gray-500" />
                                    </div>
                                    <img v-else class="rounded-full object-cover w-8 h-8" :src="vault.icon" alt="Vault Icon">
                                </div>

                                <p class="font-medium text-gray-700 select-none">{{ vault.name }}</p>
                            </div>
                        </div>

                        <!-- Add new vault (if not offline) -->
                        <div v-if="!!isOnline" class="flex flex-row items-center w-100 text-sm h-14 space-x-3 cursor-pointer" @click="router.push('/new/vault')">
                            <div class="ml-7 object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
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

import { ClockIcon, PlusIcon } from "@heroicons/vue/outline";
import { useRouter } from "vue-router";
import { useApplicationStore } from "@/stores/appStore";
import { computed } from "@vue/reactivity";
import RenameVaultModal from "./RenameVaultModal.vue";

export default defineComponent({
    components: {
    BaseModal,
    ClockIcon,
    PlusIcon,
    RenameVaultModal
},
    setup() {
        const router = useRouter();
        const applicationStore = useApplicationStore();
        const vaultStore = useVaultStore();

        const isOnline = computed(() => applicationStore.isOnline)

        // Ref controlling whether modal should be shown or not
        const showModal = ref(false);
        const showVaultRenameModal = ref(false);
        const selectedVault = ref(vaultStore.getActiveVaultId);

        // Update active vault (gets triggered when we receive the 'done' event)
        const updateActiveVault = () => {
            vaultStore.setActiveVault(selectedVault.value);
            showModal.value = !showModal.value;
        }

        // Function to toggle showVaultRenameModal
        const showRenameVault = () => {
            // If we don't have an active vault, don't open it
            if (!vaultStore.getActiveVault || !vaultStore.getActiveVaultId) {
                return;
            }

            showVaultRenameModal.value = true;
        }

        return {
            showModal,
            selectedVault,
            vaultStore,
            isOnline,
            showVaultRenameModal,

            router,
            showRenameVault,
            updateActiveVault
        }
    },
});
</script>