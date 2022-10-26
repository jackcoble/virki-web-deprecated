import { defineStore } from 'pinia'

export const useAppStore = defineStore({
  id: 'appStore',
  state: () => ({
    online: navigator.onLine,
    openMobileMenu: false
  }),

  getters: {
    isOnline: (state) => state.online,
    shouldOpenMobileMenu: (state) => state.openMobileMenu
  },

  actions: {
    setOnline(online: boolean) {
      this.online = online;
    },

    setOpenMobileMenu(open: boolean) {
      this.openMobileMenu = open;
    }
  }
})
