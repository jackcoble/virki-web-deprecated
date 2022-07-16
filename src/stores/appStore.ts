import { defineStore } from 'pinia'

// General application state
export const useAppStore = defineStore({
    id: 'application',
    state: () => ({
        online: true
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
