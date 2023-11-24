<template>
    <BaseModal @ok="handleVaultChanges">
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

                <!-- Creation date -->
                <p class="text-gray-500">
                    <small>Created at {{ vault && parseTimestamp(vault.created) }}</small>
                </p>
            </div>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/modals/BaseModal.vue";
import type { GetVaultsResponseBody } from "@/service/api/types";
import storageService from "@/service/storage";
import { useVaultStore } from "@/stores/vaultStore";
import { computed, onMounted, ref } from "vue";
import { parseISO } from "date-fns"
 
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

// Format ISO8601 date to something more human friendly
const parseTimestamp = (timestamp: string): string => {
    const parsed = parseISO(timestamp);
    return `${parsed.toLocaleDateString()} @ ${parsed.toLocaleTimeString()}`
}

// Handle any changes that have been made to the vault.
const handleVaultChanges = async () => {
    // Fetch the encrypted version of the vault.
    // We want this just in case some of the metadata hasn't changed at all.
    // Rather than re-encrypt, we can re-use instead...
    const encryptedVault = await storageService.GetVault(props.vaultId);
    console.log(encryptedVault)
}
</script>