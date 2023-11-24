<template>
    <BaseModal>
        <template v-slot:body>
            <div class="flex flex-col items-center space-y-3">
                <h1 class="text-xl">Delete <strong>{{ vaultToDelete && vaultToDelete.name }}</strong> vault?</h1>

                <p class="p-3 rounded bg-red-200 text-sm text-red-800">
                    Deleting your vault is a permanent action. Any tokens which reside in this vault
                    will also be deleted.
                </p>

                <div class="pt-2 space-y-1 w-full">
                    <p class="text-xs">To confirm this action, please type "<strong>delete</strong>" below.</p>
                    <b-input v-model="deleteConfirmation"></b-input>
                </div>
            </div>
        </template>

        <template v-slot:footer>
            <div class="mt-5 sm:mt-4 flex items-end space-y-2 space-x-2">
                <b-button type="button" classType="danger" @click="handleDeletion" :disabled="!allowDelete" :loading="isDeleting">
                    Delete
                </b-button>

                <b-button type="button" classType="light" @click="$emit('cancel')">
                    Cancel
                </b-button>
            </div>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseModal from './BaseModal.vue';
import { useVaultStore } from '@/stores/vaultStore';
import storageService  from '@/service/storage';
import userService from "@/service/api/userService"
import type { GetVaultsResponseBody } from '@/service/api/types';

const emit = defineEmits()
const props = defineProps<{
    vaultId: string
}>()

// Stores
const vaultStore = useVaultStore();

// User has to type the word "delete" for the Delete button to be enabled
const deleteConfirmation = ref("");
const allowDelete = computed(() => deleteConfirmation.value === "delete");
const isDeleting = ref(false);

const vaultToDelete = ref<GetVaultsResponseBody>();

onMounted(() => {
    // Create a copy of the vault we want to delete.
    // This is so we can keep some modal state whilst it's being deleted.
    vaultToDelete.value = vaultStore.getAll.find(v => v.id === props.vaultId);
})

// Handle deleting the Vault from the decrypted store, encrypted DB and API
const handleDeletion = async () => {
    isDeleting.value = true;

    // Remove vault from API first, followed by local stores
    await userService.DeleteVault(props.vaultId);
    vaultStore.delete(props.vaultId);
    await storageService.DeleteVault(props.vaultId);
    
    isDeleting.value = false;

    emit("close");
}
</script>