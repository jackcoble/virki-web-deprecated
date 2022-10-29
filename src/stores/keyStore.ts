import { defineStore } from 'pinia';
import { useStorage, useSessionStorage } from "@vueuse/core";

import { useUserStore } from './userStore';
import type { Keys } from '@/common/interfaces/keys';

import { LocalStorageKeys } from '@/common/enums/localStorage';
import { SessionStorageKeys } from '@/common/enums/sessionStorage';

export const useKeyStore = defineStore({
  id: 'keyStore',
  state: () => ({
    master_encryption_key: useSessionStorage(SessionStorageKeys.MASTER_ENCRYPTION_KEY, ""),
    encrypted_keys: useStorage(LocalStorageKeys.ENCRYPTED_KEYS, {} as Keys)
  }),

  getters: {
    getSessionToken: () => {
      const userStore = useUserStore();
      return userStore.getSessionToken;
    },
    getMasterEncryptionKey: (state) => state.master_encryption_key,
    getEncryptedKeys: (state) => {
        // So after many hours of tearing my hair out, it turns out WebWorkers hate objects with function signatures being
        // provided to them! So before returning the encrypted keys, stringify the object into JSON and then parse it again,
        // just so we have a plain old JSON object.
        const encryptedKeysStringified = JSON.stringify(state.encrypted_keys);
        const parsedEncryptedKeys: Keys = JSON.parse(encryptedKeysStringified);

        return parsedEncryptedKeys;
    }
  },

  actions: {
    // Persist the decrypted master key in Session Storage
    setMasterEncryptionKey(key: string) {
      this.master_encryption_key = key;
    },

    setEncryptedKeys(keys: Keys) {
      this.encrypted_keys = keys;
    },

    clearMasterEncryptionKey() {
      this.master_encryption_key = null as any;
    },

    // Clears all keys
    clear() {
      this.master_encryption_key = null as any;
      this.encrypted_keys = null as any
    }
  },
})
