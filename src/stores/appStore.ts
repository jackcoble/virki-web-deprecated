import { defineStore } from 'pinia'

// General application state
export const useApplicationStore = defineStore({
    id: 'application',
    state: () => ({
        online: navigator.onLine,
        inactivityTimeout: localStorage.getItem("inactivityTimeout") || "10" // 10 minute default inactivity timeout
    }),
    getters: {
        isOnline: (state) => state.online,
        getInactivityTimeout: (state) => parseInt(state.inactivityTimeout)
    },
    actions: {
        setOnline(online: boolean) {
            this.online = online;
        },

        setInactivityTimeout(timeout: string) {
            this.inactivityTimeout = timeout;
            localStorage.setItem("inactivityTimeout", timeout)
        }
    },
})
