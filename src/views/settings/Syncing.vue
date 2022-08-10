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
                <div v-for="sType in syncTypes" @click="selectSyncType(sType.id)">
                    <input type="radio" :value="sType.id" :checked="selectedSyncType === sType.id.toString()">
                    <label class="mx-2">{{ sType.label }}</label>
                </div>
            </fieldset>

            <b-input v-if="selectedSyncType !== '0'" placeholder="http(s)://username:password@hostname/database" v-model="syncServer" :readonly="selectedSyncType === '1'"></b-input>
            <b-button @click="applyChanges">Apply</b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { SYNC_TYPE } from "@/class/pouchdb"
import useToaster from "@/composables/useToaster";
import { useApplicationStore } from "@/stores/appStore"
import { useAuthenticationStore } from "@/stores/authenticationStore";
import { computed } from "@vue/reactivity";
import { defineComponent, ref } from "vue"

export default defineComponent({
    name: "Settings",
    setup() {
        const authenticationStore = useAuthenticationStore();
        const applicationStore = useApplicationStore();
        const toaster = useToaster();

        const activeSyncType = computed(() => applicationStore.getSync.type);
        const selectedSyncType = ref(applicationStore.getSync.type);

        const currentSyncServer = applicationStore.getSync.url;
        const syncServer = ref(applicationStore.getSync.url);

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

        const selectSyncType = (syncType: SYNC_TYPE) => {
            // If user has selected Authoriser Sync Server, then we need to set the sync URL
            if (syncType === SYNC_TYPE.CLOUD) {
                const trimmedUserID = authenticationStore.getActiveAccount.replace(/-/g, "");
                const dbName = `user_db-${trimmedUserID}`;

                syncServer.value = `${window.location.protocol}//${window.location.host}/api/v1/store/${dbName}`;
            }
            else if (syncType === SYNC_TYPE.CUSTOM) {
                // Clear the sync server value
                syncServer.value = "";
            }

            selectedSyncType.value = syncType.toString();
        }

        const applyChanges = () => {
            // Depending on the sync option, we need to handle setting the database names and remote URLs differently.
            const syncType = parseInt(selectedSyncType.value);

            const trimmedUserID = authenticationStore.getActiveAccount.replace(/-/g, "");
            const dbName = `user_db-${trimmedUserID}`;
            let dbUrl = "";

            switch (syncType) {
                case SYNC_TYPE.LOCAL:
                    // If we're local, we just want to create a URL pointing at localhost with our constructed DB name.
                    dbUrl = `http://127.0.0.1/${dbName}`;
                    applicationStore.setSyncDetails(SYNC_TYPE.LOCAL, dbName, dbUrl);

                    break;

                case SYNC_TYPE.CLOUD:
                    // Sync the database with the hosted instance of Authoriser Sync Server
                    dbUrl = `${window.location.protocol}//${window.location.host}/api/v1/store/${dbName}`;
                    applicationStore.setSyncDetails(SYNC_TYPE.CLOUD, dbName, dbUrl);

                    break;

                case SYNC_TYPE.CUSTOM:
                    // Parse the custom URL to extract the database name
                    const serverUrl = new URL(syncServer.value);
                    const db = serverUrl.pathname.split("/").pop();

                    // If there is no DB extracted, throw an error
                    if (!db) {
                        toaster.error("No database provided in CouchDB URL!");
                        return;
                    }

                    applicationStore.setSyncDetails(SYNC_TYPE.CUSTOM, db, serverUrl.toString());

                    break;

                default:
                    break;
            }
        }
        
        return {
            activeSyncType,
            selectedSyncType,
            currentSyncServer,
            syncServer,
            syncTypes,

            selectSyncType,
            applyChanges
        }
    }
})
</script>