import { defineStore } from 'pinia';
import { useSessionStorage } from "@vueuse/core";
import { SessionStorageKeys } from '@/common/enums/storage';

export const useKeyStore = defineStore({
  id: 'keyStore',
  state: () => ({
    master_encryption_key: useSessionStorage(SessionStorageKeys.MASTER_ENCRYPTION_KEY, "")
  }),

  getters: {
    // Returns the raw and plaintext master encryption key inside SessionStorage
    getMasterEncryptionKey: (state) => state.master_encryption_key
  },

  actions: {
    // Persist the decrypted master key in SessionStorage
    setMasterEncryptionKey(key: string) {
      this.master_encryption_key = key;
    },

    // Removes the decrypted master key in SessionStorage
    clearMasterEncryptionKey() {
      this.master_encryption_key = null as any;
    }
  },
})
