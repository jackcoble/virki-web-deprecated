import { SYNC_TYPE } from '@/class/pouchdb';
import { defineStore } from 'pinia'

// General application state
export const useApplicationStore = defineStore({
    id: 'application',
    state: () => ({
        online: false,
        syncing: false,
        sync_db: localStorage.getItem("sync_db") || "",
        inactivityTimeout: localStorage.getItem("inactivityTimeout") || "10", // 10 minute default inactivity timeout

        sync: {
            type: localStorage.getItem("sync_type") || SYNC_TYPE.CLOUD.toString(), // Default to cloud if not present
            db: localStorage.getItem("sync_db") || "",
            url: localStorage.getItem("sync_url") || ""
        }
    }),
    getters: {
        isOnline: (state) => state.online,
        isSyncing: (state) => state.syncing,
        getSyncDB: (state) => state.sync_db,
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

        setSyncDB(database: string) {
            this.sync.db = database;
            localStorage.setItem("sync_db", database);
        },

        setSyncURL(url: string) {
            this.sync.url = url;
            localStorage.setItem("sync_url", url);
        },

        setSyncType(type: SYNC_TYPE) {
            const typeString = type.toString();

            this.sync.type = typeString;
            localStorage.setItem("sync_type", typeString);
        }
    },
})
