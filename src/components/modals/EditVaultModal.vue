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
import type { GetVaultsResponseBody, UpdateVaultRequestBody } from "@/service/api/types";
import storageService from "@/service/storage";
import { useVaultStore } from "@/stores/vaultStore";
import { computed, onMounted, ref } from "vue";
import { parseISO } from "date-fns"
import { cryptoWorker } from "@/common/comlink";
import { serialiseCipherString } from "@/common/utils/cipher";
import { EncryptionType } from "@/common/enums/encryptionType";
import userService from "@/service/api/userService";
 
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
    // Clear existing error
    errorMessage.value = "";

    // Fetch the encrypted version of the vault.
    // We want this just in case some of the metadata hasn't changed at all.
    // Rather than re-encrypt, we can re-use instead...
    const encryptedVault = await storageService.GetVault(props.vaultId);
    
    if (!vault.value || !editedVault.value) {
        errorMessage.value = "Decrypted vault not found in store!";
        return;
    }

    // Retrieve the Vault encryption key
    const encryptionKey = vault.value.encryptionKey;

    // Check if the Vault name has changed
    if (editedVault.value.name !== vault.value.name) {
        // Cannot have an empty vault name!
        if (!editedVault.value.name) {
            errorMessage.value = "Cannot have an empty vault name!";
            return;
        }

        const encryptedName = await cryptoWorker.encryptUTF8(editedVault.value.name, encryptionKey);
        const encryptedNameCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedName.ciphertext, encryptedName.nonce, encryptedName.mac);
        encryptedVault.name = encryptedNameCipherString;
    }

    // Check if the Vault description has changed
    if (editedVault.value.description !== vault.value.description) {
        // First should check to see if the new description is empty.
        // If so, that means we want to remove the description from the vault
        if (!editedVault.value.description) {
            delete encryptedVault.description;
        } else {
            // Otherwise re-encrypt the new description
            const encryptedDescription = await cryptoWorker.encryptUTF8(editedVault.value.description, encryptionKey);
            const encryptedDescriptionCipherString = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedDescription.ciphertext, encryptedDescription.nonce, encryptedDescription.mac);
            encryptedVault.description = encryptedDescriptionCipherString;
        }
    }

    // Send the whole encrypted vault object we've modifed back to the API.
    // Whatever the API receives in this object, the details will be reflected.
    const updatedVaultRequest: UpdateVaultRequestBody = {
        name: encryptedVault.name,
        description: encryptedVault.description,
        icon: encryptedVault.icon
    }

    try {
        await userService.UpdateVault(encryptedVault.id, updatedVaultRequest);
    } catch (e) {
        errorMessage.value = e.response.data.error;
    }
}
</script>