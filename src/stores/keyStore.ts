import { defineStore } from 'pinia';
import { useSessionStorage } from "@vueuse/core";
import { SessionStorageKeys } from '@/common/enums/storage';

export const useKeyStore = defineStore({
  id: 'keyStore',
  state: () => ({
    master_encryption_key: useSessionStorage(SessionStorageKeys.MASTER_ENCRYPTION_KEY, ""),
    sharing_private_key: useSessionStorage(SessionStorageKeys.SHARING_PRIVATE_KEY, "")
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

    // Persist the decrypted sharing private key in SessionStorage
    setSharingPrivateKey(key: string) {
      this.sharing_private_key = key;
    },

    // Removes the keys in SessionStorage
    clear() {
      this.master_encryption_key = null as any;
      this.sharing_private_key = null as any;
    }
  },
})
