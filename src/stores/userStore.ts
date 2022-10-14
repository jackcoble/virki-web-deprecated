import type { Account } from '@/common/interfaces/account';
import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    account: useStorage("account", {} as Account)
  }),

  getters: {
    getUserID: (state) => state.account.id,
    getEmail: (state) => state.account.email,
    getSessionToken: (state) => state.account.session_token
  },

  actions: {
    setAccount(account: Account) {
      this.account = account;
    },

    // Clears entire store state
    clear() {
      this.account = null as any;
    }
  },
})
