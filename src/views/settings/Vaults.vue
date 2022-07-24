<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-4">
            <h2 class="text-2xl font-semibold text-gray-900">Manage Vaults</h2>

            <p class="text-sm">Here you can manage all of your Authoriser vaults. If you wish to delete some vaults,
                this is your place to do it!</p>

            <!-- List of all vaults -->
            <div class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                <div v-for="(vault) in vaultStore.getVaults" :key="vault.v_id" class="p-2.5">
                    <div class="mr-3 flex flex-row items-center space-x-3 w-full text-sm">
                        <div class="rounded-full bg-gray-200 border-2 border-gray-300">
                            <div v-if="!vault.icon" class="w-8 h-8 p-1.5 bg-gray-200 rounded-full">
                                <ClockIcon class="text-gray-500" />
                            </div>
                            <img v-else class="rounded-full object-cover w-8 h-8" :src="vault.icon" alt="Vault Icon">
                        </div>

                        <p class="font-medium text-gray-700 select-none flex-1">{{ vault.name }}</p>

                        <b-button classType="danger" class="px-2 py-1.5 w-auto" @click="deleteVaultModal(vault.v_id)" :disabled="!isOnline">
                            <TrashIcon class="w-4" />
                        </b-button>
                    </div>
                </div>
            </div>

            <!-- Modal to confirm vault deletion -->
            <BaseModal v-if="showDeleteVaultModal" okFooter @close="showDeleteVaultModal = !showDeleteVaultModal" @ok="handleDeleteVault">
                <template v-slot:body>
                    <div class="space-y-3">
                        <!-- Icon -->
                        <div class="flex justify-center">
                            <div class="rounded-full bg-gray-200 border-2 border-gray-300 cursor-pointer">
                                <PhotographIcon v-if="!selectedVault.icon"
                                    class="text-gray-500 rounded-full w-24 p-4" />
                                <img v-if="selectedVault.icon" class="rounded-full object-cover w-24 h-24"
                                    :src="selectedVault.icon" alt="Vault Icon">
                            </div>
                        </div>

                        <!-- Explainer text -->
                        <p class="text-sm font-semibold text-center">
                            Enter '{{ selectedVault.name }}' and then confirm vault deletion by pressing "OK".
                        </p>
                        <p class="text-sm text-center">This vault, and all of the tokens stored inside it, will be permanently deleted.</p>

                        <!-- Input to capture name -->
                        <b-input type="text" :placeholder="selectedVault.name" v-model="vaultNameConfirmation"></b-input>
                    </div>
                </template>
            </BaseModal>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useVaultStore } from "@/stores/vaultStore";
import { TrashIcon, PhotographIcon, ClockIcon } from "@heroicons/vue/outline";
import BaseModal from "../../components/Modal/BaseModal.vue";
import useToaster from "@/composables/useToaster";
import vaultService from "@/service/api/vaultService";
import useAuthoriserDB from "@/composables/useAuthoriserDB";
import { useApplicationStore } from "@/stores/appStore";

export default defineComponent({
    name: "SettingsVaults",
    components: {
        TrashIcon,
        BaseModal,
        PhotographIcon,
        ClockIcon
    },
    setup() {
        const applicationStore = useApplicationStore();
        const vaultStore = useVaultStore();
        const authoriserDB = useAuthoriserDB();
        const toaster = useToaster();

        const isOnline = computed(() => applicationStore.isOnline);

        // Refs to track what modal to show
        const showDeleteVaultModal = ref(false);

        // Selected vault and name confirmation
        const selectedVault = ref();
        const vaultNameConfirmation = ref("");

        // Capture the Vault ID so we can fetch its data and show the modal
        const deleteVaultModal = (id: string) => {
            const vault = vaultStore.getVaults.find(v => v.v_id === id);
            if (!vault) {
                return;
            }

            selectedVault.value = vault;
            showDeleteVaultModal.value = !showDeleteVaultModal.value;
        }

        // Handle vault deletion locally and via API
        const handleDeleteVault = async () => {
            if (!selectedVault.value.v_id) {
                return;
            }

            // Check that the names match
            if (vaultNameConfirmation.value !== selectedVault.value.name) {
                return toaster.error("Vault name provided is incorrect!");
            }

            // Delete locally first
            try {
                await authoriserDB.removeVault(selectedVault.value.v_id);
            } catch (e) {
                console.log("Error deleting from IDB:", e);
                toaster.error("There was an error removing vault from this device!");

                return;
            }

            // Delete from API
            try {
                await vaultService.DeleteVault(selectedVault.value.v_id);
            } catch (e) {
                return toaster.error(e.response.data.error);
            }

            // Remove vault from store
            vaultStore.remove(selectedVault.value.v_id);

            // Hide modal
            showDeleteVaultModal.value = !showDeleteVaultModal.value;
        }

        return {
            vaultStore,
            selectedVault,
            showDeleteVaultModal,
            vaultNameConfirmation,
            isOnline,

            deleteVaultModal,
            handleDeleteVault
        };
    }
})
</script>