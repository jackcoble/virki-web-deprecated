import { defineStore } from 'pinia'

// General application state
export const useApplicationStore = defineStore({
    id: 'application',
    state: () => ({
        online: navigator.onLine
    }),
    getters: {
        isOnline: (state) => state.online
    },
    actions: {
        setOnline(online: boolean) {
            this.online = online;
        }
    },
})
