import { SESSION_KEYS, setKey } from '@/utils/storage/sessionStorage';
import { defineStore } from 'pinia'

export const useKeyStore = defineStore({
  id: 'keyStore',
  state: () => ({
    masterEncryptionKey: ""
  }),

  getters: {
    getMasterEncryptionKey: (state) => state.masterEncryptionKey
  },

  actions: {
    setMasterEncryptionKey(key: string) {
        this.masterEncryptionKey = key;

        // Persist key in session storage
        setKey(SESSION_KEYS.MASTER_ENCRYPTION_KEY, { key });
    }
  },
})
