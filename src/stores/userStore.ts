import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { LocalStorageKeys } from '@/common/enums/storage';
import type { GetKeysResponse } from '@/service/api/types';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    email: useStorage<string>(LocalStorageKeys.EMAIL, ""),
    session: useStorage<string>(LocalStorageKeys.SESSION, ""),
    keys: useStorage(LocalStorageKeys.KEYS, {})
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

    // Persist the encrypted keys
    setKeys(keys: GetKeysResponse) {
      this.keys = keys;
    },

    clear() {
      this.email = "";
      this.session = "";
    }
  },
})
