import { SYNC_TYPE } from '@/class/pouchdb';
import { defineStore } from 'pinia'

// General application state
export const useApplicationStore = defineStore({
    id: 'application',
    state: () => ({
        online: false,
        syncing: false,
        inactivityTimeout: localStorage.getItem("inactivityTimeout") || "10", // 10 minute default inactivity timeout

        sync: {
            type: SYNC_TYPE.CLOUD,
            db: "",
            url: `${window.location.protocol}//${window.location.host}/api/v1/store` // Default to own service if not present
        }
    }),
    getters: {
        isOnline: (state) => state.online,
        isSyncing: (state) => state.syncing,
        getSync: (state) => state.sync,
        getInactivityTimeout: (state) => parseInt(state.inactivityTimeout)
    },
    actions: {
        // Initialise sync data
        initialise() {
            const syncDataString = localStorage.getItem("sync");
            if (syncDataString) {
                const syncData = JSON.parse(syncDataString);

                this.setSync(syncData.type, syncData.db, syncData.url);
            }
        },

        setOnline(online: boolean) {
            this.online = online;
        },

        setInactivityTimeout(timeout: string) {
            this.inactivityTimeout = timeout;
            localStorage.setItem("inactivityTimeout", timeout)
        },

        setSyncing(sync: boolean) {
            this.syncing = sync;
        },

        // Store syncing data in LocalStorage for persistance
        setSync(type: SYNC_TYPE, database: string, remote: string) {
            this.sync.type = type;
            this.sync.db = database;
            this.sync.url = remote;

            localStorage.setItem("sync", JSON.stringify(this.sync));
        }
    },
})
