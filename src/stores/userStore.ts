import { defineStore } from 'pinia'
import { useStorage } from "@vueuse/core"
import { LocalStorageKeys } from '@/common/enums/storage';
import type { AccountInfoResponse } from 'virki-axios';
import type { Keys } from '@/common/interfaces/keys';

export const useUserStore = defineStore({
  id: 'userStore',
  state: () => ({
    account: useStorage(LocalStorageKeys.ACCOUNT, {} as AccountInfoResponse),
    tokens: useStorage(LocalStorageKeys.TOKENS, {
      accessToken: null,
      refreshToken: null
    } as any)
  }),

  getters: {
    getAccessToken: (state) => state.tokens.accessToken,
    getRefreshToken: (state) => state.tokens.refreshToken,

    getUserID: (state) => state.account.id,
    getEmail: (state) => state.account ? state.account.email : "",
    getName: (state) => state.account.name,
    
    getEncryptedKeys: (state) => {
      const keys: Keys = {
        kek: {
          hash: state.account.kek?.hash!,
          salt: state.account.kek?.salt!,
          ops_limit: state.account.kek?.opsLimit!,
          mem_limit: state.account.kek?.memLimit!
        },

        master_encryption_key: state.account.masterEncryptionKey!,
  
        keypair: {
            public_key: state.account.keypair?.publicKey!,
            private_key: state.account.keypair?.publicKey!
        },

        recovery: {
          master_key_encrypted_with_recovery_key: state.account.recovery?.masterKeyEncryptedWithRecoveryKey!,
          recovery_key_encrypted_with_master_key: state.account.recovery?.recoveryKeyEncryptedWithMasterKey!
        }
      }

      return keys;
    }
  },

  actions: {
    // Persist the access + refresh tokens in LocalStorage
    setTokens(accessToken: string, refreshToken: string) {
      this.tokens.accessToken = accessToken;
      this.tokens.refreshToken = refreshToken;
    },

    // Persist the account information response as it
    // contains basic account information and encrypted keys
    setAccount(account: AccountInfoResponse) {
      this.account = account;
    },

    clear() {
      this.account = null as any;
      this.tokens = null;
    }
  },
})
