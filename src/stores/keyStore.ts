import { LocalStorageKeys } from '@/common/enums/localStorage';
import { SessionStorageKeys } from '@/common/enums/sessionStorage';
import { LocalStorageService } from '@/common/services/localStorage.service';
import { SessionStorageService } from '@/common/services/sessionStorage.service';
import type { Keys } from '@/common/interfaces/keys';
import { defineStore } from 'pinia'
import { useUserStore } from './userStore';

const localStorage = new LocalStorageService();
const sessionStorage = new SessionStorageService();

export const useKeyStore = defineStore({
  id: 'keyStore',
  state: () => ({
    masterEncryptionKey: sessionStorage.get(SessionStorageKeys.MASTER_ENCRYPTION_KEY),
    encryptedKeys: localStorage.get(LocalStorageKeys.ENCRYPTED_KEYS)
  }),

  getters: {
    getSessionToken: (state) => {
      const userStore = useUserStore();
      return userStore.getSessionToken;
    },
    getMasterEncryptionKey: (state) => state.masterEncryptionKey,
    getEncryptedKeys: (state) => {
        // So after many hours of tearing my hair out, it turns out WebWorkers hate objects with function signatures being
        // provided to them! So before returning the encrypted keys, stringify the object into JSON and then parse it again,
        // just so we have a plain old JSON object.
        const encryptedKeysStringified = JSON.stringify(state.encryptedKeys);
        const parsedEncryptedKeys = JSON.parse(encryptedKeysStringified) as Keys;

        return parsedEncryptedKeys;
    }
  },

  actions: {
    setMasterEncryptionKey(key: string) {
        this.masterEncryptionKey = key;

        // Persist key in session storage
        sessionStorage.add(SessionStorageKeys.MASTER_ENCRYPTION_KEY, key);
    },

    setEncryptedKeys(keys: Keys) {
        this.encryptedKeys = keys as any;
        localStorage.add(LocalStorageKeys.ENCRYPTED_KEYS, keys)
    },

    // Clears entire store state
    clear() {
      this.masterEncryptionKey = "";
      this.encryptedKeys = null;
    }
  },
})
