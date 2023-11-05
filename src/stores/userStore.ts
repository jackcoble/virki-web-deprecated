import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { LocalStorageKeys } from '@/common/enums/storage';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    email: useStorage<string>(LocalStorageKeys.EMAIL, ""),
    session: useStorage<string>(LocalStorageKeys.SESSION, "")
  }),

  getters: {
    getEmail: (state) => state.email,
    getSessionToken: (state) => state.session
  },

  actions: {
    // Persist user email
    setEmail(email: string) {
      this.email = email;
    },

    // Persist the session token
    setSessionToken(token: string) {
      this.session = token;
    },

    clear() {
      this.email = "";
      this.session = "";
    }
  },
})
