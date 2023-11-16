import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { LocalStorageKeys } from '@/common/enums/storage';
import type { GetAccountResponseBody, GetKeysResponse } from '@/service/api/types';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    account: useStorage<GetAccountResponseBody>(LocalStorageKeys.ACCOUNT, {} as any),
    keys: useStorage<GetKeysResponse>(LocalStorageKeys.KEYS, {} as any),
    session: useStorage<string>(LocalStorageKeys.SESSION, "")
  }),

  getters: {
    getEmail: (state) => state.account.email,
    getName: (state) => state.account.name,
    getSessionToken: (state) => state.session,
    getKeys: (state) => state.keys
  },

  actions: {
    setAccount(account: GetAccountResponseBody) {
      this.account = account;
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
      this.account = null as any;
      this.keys = null as any;
      this.session = "";
    }
  },
})
