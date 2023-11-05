import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { LocalStorageKeys } from '@/common/enums/storage';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    session: useStorage<string>(LocalStorageKeys.SESSION, "")
  }),

  getters: {
    getSessionToken: (state) => state.session
  },

  actions: {
    // Persist the session token
    setSessionToken(token: string) {
      this.session = token;
    },

    clear() {
      this.session = "";
    }
  },
})
