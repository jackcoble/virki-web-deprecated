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
                    <label class="mx-2">{{ sType.label }}</label>
                </div>
            </fieldset>

            <b-input v-if="selectedSyncType !== '0'" placeholder="http(s)://username:password@hostname/database" v-model="syncServer" :readonly="selectedSyncType === '1'"></b-input>
            <b-button v-if="selectedSyncType !== activeSyncType" @click="applyChanges">Apply</b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { SYNC_TYPE } from "@/class/pouchdb"
import useToaster from "@/composables/useToaster";
import { useApplicationStore } from "@/stores/appStore"
import { computed } from "@vue/reactivity";
import { defineComponent, ref } from "vue"

export default defineComponent({
    name: "Settings",
    setup() {
        const applicationStore = useApplicationStore();
        const toaster = useToaster();

        const activeSyncType = computed(() => applicationStore.getSync.type);
        const selectedSyncType = ref(applicationStore.getSync.type);
        const syncServer = ref(applicationStore.getSync.url + '/' + applicationStore.getSync.db);

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

        const selectSyncType = (syncType: string) => {
            selectedSyncType.value = syncType;
        }

        const applyChanges = () => {
            // Parse the custom URL to extract the database name
            const serverUrl = new URL(syncServer.value);
            const db = serverUrl.pathname.split("/").pop();

            // If there is no DB extracted, throw an error
            if (!db) {
                return toaster.error("No database provided in CouchDB URL!");
            }

            // Set the modifications in application store
            const sType = parseInt(selectedSyncType.value);
            applicationStore.setSyncDetails(sType, db, serverUrl.toString())
        }
        
        return {
            activeSyncType,
            selectedSyncType,
            syncServer,
            syncTypes,

            selectSyncType,
            applyChanges
        }
    }
})
</script>