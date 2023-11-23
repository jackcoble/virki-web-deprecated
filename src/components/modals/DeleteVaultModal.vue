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
                <b-button type="button" classType="danger" @click="$emit('delete')" :disabled="!allowDelete">
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
import { computed, ref } from 'vue';
import BaseModal from './BaseModal.vue';
import { useVaultStore } from '@/stores/vaultStore';

const props = defineProps<{
    vaultId: string
}>()

// Stores
const vaultStore = useVaultStore();

// User has to type the word "delete" for the Delete button to be enabled
const deleteConfirmation = ref("");
const allowDelete = computed(() => deleteConfirmation.value === "delete");

const vaultToDelete = computed(() => vaultStore.getAll.find(v => v.id === props.vaultId));
</script>