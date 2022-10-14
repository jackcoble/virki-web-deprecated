import { LocalStorageKeys } from '@/common/enums/localStorage';
import type { Account } from '@/common/interfaces/account';
import { LocalStorageService } from '@/common/services/localStorage.service';
import { defineStore } from 'pinia'

const localStorage = new LocalStorageService();

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    account: {} as Account
  }),

  getters: {
    getUserID: (state) => state.account.id,
    getEmail: (state) => state.account.email,
    getSessionToken: (state) => state.account.session_token
  },

  actions: {
    setAccount(account: Account) {
      this.account = account;
      localStorage.add(LocalStorageKeys.ACCOUNT, account);
    },

    // Clears entire store state
    clear() {
      this.account = null as any;
    }
  },
})
