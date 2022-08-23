import { defineStore } from 'pinia'

export const useAppStore = defineStore({
  id: 'appStore',
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
  }
})
