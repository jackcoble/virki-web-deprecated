import { getUnixTime } from 'date-fns';
import { defineStore } from 'pinia'

export const useAppStore = defineStore({
  id: 'appStore',
  state: () => ({
    online: navigator.onLine,
    openMobileMenu: false,
    lastActive: getUnixTime(new Date())
  }),

  getters: {
    isOnline: (state) => state.online,
    shouldOpenMobileMenu: (state) => state.openMobileMenu,
    getLastActiveTimestamp: (state) => state.lastActive
  },

  actions: {
    setOnline(online: boolean) {
      this.online = online;
    },

    setOpenMobileMenu(open: boolean) {
      this.openMobileMenu = open;
    },

    setLastActiveTimestamp(timestamp: number) {
      this.lastActive = timestamp;
    }
  }
})
