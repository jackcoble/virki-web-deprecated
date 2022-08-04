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
            type: localStorage.getItem("sync_type") || SYNC_TYPE.CLOUD.toString(), // Default to cloud if not present
            db: localStorage.getItem("sync_db") || "",
            url: localStorage.getItem("sync_url") || `${window.location.protocol}//${window.location.hostname}/v1/store` // Default to own service if not present
        }
    }),
    getters: {
        isOnline: (state) => state.online,
        isSyncing: (state) => state.syncing,
        getSyncType: (state) => parseInt(state.sync.type),
        getSync: (state) => state.sync,
        getInactivityTimeout: (state) => parseInt(state.inactivityTimeout)
    },
    actions: {
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

        setSyncDetails(type: SYNC_TYPE, database: string, host?: string) {
            // Sync type
            const typeString = type.toString();

            this.sync.type = typeString;
            localStorage.setItem("sync_type", typeString);

            // Database
            this.sync.db = database;
            localStorage.setItem("sync_db", database);

            // CouchDB host
            if (host) {
                this.sync.url = host;
                localStorage.setItem("sync_url", host);
            }
        }
    },
})
