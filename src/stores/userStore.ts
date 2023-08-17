import type { Account } from '@/common/interfaces/account';
import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { LocalStorageKeys } from '@/common/enums/storage';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    account: useStorage(LocalStorageKeys.ACCOUNT, {} as Account),
    avatarUrl: "",

    tokens: useStorage(LocalStorageKeys.TOKENS, {
      accessToken: null,
      refreshToken: null
    } as any)
  }),

  getters: {
    getAccessToken: (state) => state.account.accessToken,
    getRefreshToken: (state) => state.account.refreshToken,

    getUserID: (state) => state.account.id,
    getEmail: (state) => state.account ? state.account.email : "",
    getName: (state) => state.account.name,
    getAvatarURL: (state) => state.avatarUrl
  },

  actions: {
    // Persist the access + refresh tokens in LocalStorage
    setTokens(accessToken: string, refreshToken: string) {
      this.tokens.accessToken = accessToken;
      this.tokens.refreshToken = refreshToken;
    },

    setAccount(account: Account) {
      this.account = account;
    },

    setAvatarURL(url: string) {
      this.avatarUrl = url;
    },

    clear() {
      this.account = null as any;
    }
  },
})
