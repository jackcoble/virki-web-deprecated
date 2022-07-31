import { defineStore } from 'pinia'

// General application state
export const useApplicationStore = defineStore({
    id: 'application',
    state: () => ({
        online: false,
        syncing: false,
        sync_db: localStorage.getItem("sync_db") || "",
        inactivityTimeout: localStorage.getItem("inactivityTimeout") || "10" // 10 minute default inactivity timeout
    }),
    getters: {
        isOnline: (state) => state.online,
        isSyncing: (state) => state.syncing,
        getSyncDB: (state) => state.sync_db,
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
            this.sync_db = database;
            localStorage.setItem("sync_db", database);
        }
    },
})
