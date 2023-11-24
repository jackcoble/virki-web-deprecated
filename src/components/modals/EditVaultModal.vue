<template>
    <BaseModal>
        <template v-slot:body>
            <div class="flex flex-col items-center space-y-4">
                <h1 class="text-xl">Editing <strong>{{ vault && vault.name }}</strong> vault</h1>

                <!-- Error message -->
                <div v-if="!!errorMessage" class="w-full rounded p-2 bg-red-300 text-red-800 text-sm">
                    <p>{{ errorMessage }}</p>
                </div>

                <form v-if="editedVault" class="w-full space-y-2" @submit.prevent>
                    <b-input v-model="editedVault.name" placeholder="Vault name" autofocus></b-input>
                    <b-text-area v-model="editedVault.description" placeholder="Description"></b-text-area>
                </form>
            </div>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/modals/BaseModal.vue";
import type { GetVaultsResponseBody } from "@/service/api/types";
import { useVaultStore } from "@/stores/vaultStore";
import { computed, onMounted, ref } from "vue";

const props = defineProps<{
    vaultId: string
}>();

// Stores
const vaultStore = useVaultStore();
const vault = computed(() => vaultStore.getAll.find(v => v.id === props.vaultId));
const editedVault = ref<GetVaultsResponseBody>();

const errorMessage = ref("");

onMounted(() => {
    // Create a copy of the Vault we've fetched from the store.
    // We want this to make changes to...
    if (!vault.value) {
        errorMessage.value = "Decrypted vault not found in store!"
        return;
    }

    editedVault.value = { ...vault.value }
})
</script>