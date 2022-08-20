import type { Keys } from '@/types/user';
import { getKey, SESSION_KEYS, setKey } from '@/utils/storage/sessionStorage';
import { defineStore } from 'pinia'

export const useKeyStore = defineStore({
  id: 'keyStore',
  state: () => ({
    sessionToken: "",
    masterEncryptionKey: getKey(SESSION_KEYS.MASTER_ENCRYPTION_KEY) || "",
    encryptedKeys: {} as Keys
  }),

  getters: {
    getSessionToken: (state) => state.sessionToken,
    getMasterEncryptionKey: (state) => state.masterEncryptionKey,
    getEncryptedKeys: (state) => state.encryptedKeys
  },

  actions: {
    setSessionToken(token: string) {
        this.sessionToken = token;
    },

    setMasterEncryptionKey(key: string) {
        this.masterEncryptionKey = key;

        // Persist key in session storage
        setKey(SESSION_KEYS.MASTER_ENCRYPTION_KEY, key);
    },

    setEncryptedKeys(keys: Keys) {
        this.encryptedKeys = keys;
    }
  },
})
