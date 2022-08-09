<template>
    <div class="h-screen bg-gray-50">
        <div class="container p-4 mx-auto space-y-3">
            <h2 class="text-2xl font-semibold text-gray-900">Syncing</h2>

            <!-- Save Description -->
            <div class="p-3 bg-blue-300 rounded">
                <p class="text-sm">Authoriser keeps your data safe and in the cloud with zero-knowledge encryption,
                    allowing you to use it on any of your devices.</p>
            </div>

            <!-- Sync options -->
            <fieldset class="space-y-3">
                <div v-for="sType in syncTypes" @click="selectedSyncType = sType.id.toString()">
                    <input type="radio" :value="sType.id" :checked="selectedSyncType === sType.id.toString()">
                    <label>{{ sType.label }}</label>
                </div>
            </fieldset>
        </div>
    </div>
</template>

<script lang="ts">
import { SYNC_TYPE } from "@/class/pouchdb"
import { useApplicationStore } from "@/stores/appStore"
import { computed } from "@vue/reactivity";
import { defineComponent, onMounted, ref } from "vue"

export default defineComponent({
    name: "Settings",
    setup() {
        const applicationStore = useApplicationStore();

        const activeSyncType = computed(() => applicationStore.getSync.type);
        const selectedSyncType = ref(applicationStore.getSync.type);

        const syncTypes = [
            {
                id: SYNC_TYPE.LOCAL,
                label: "Don't Sync"
            },
            {
                id: SYNC_TYPE.CLOUD,
                label: "Authoriser Sync Server"
            },
            {
                id: SYNC_TYPE.CUSTOM,
                label: "Advanced (CouchDB)"
            }
        ]
        
        return {
            activeSyncType,
            selectedSyncType,

            syncTypes
        }
    }
})
</script>