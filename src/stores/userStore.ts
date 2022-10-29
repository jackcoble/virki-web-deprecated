import type { Account } from '@/common/interfaces/account';
import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { LocalStorageKeys } from '@/common/enums/localStorage';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    account: useStorage(LocalStorageKeys.ACCOUNT, {} as Account)
  }),

  getters: {
    getUserID: (state) => state.account.id,
    getEmail: (state) => state.account.email,
    getSessionToken: (state) => state.account.session_token,
    getPlan: (state) => state.account.plan
  },

  actions: {
    setAccount(account: Account) {
      this.account = account;
    },

    setActiveVault(id: string) {
      this.account.active_vault_id = id;
    },

    clear() {
      this.account = null as any;
    }
  },
})
