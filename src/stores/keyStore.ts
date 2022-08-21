import type { Keys } from '@/types/user';
import { getData, LS_KEYS, setData } from '@/utils/storage/localStorage';
import { getKey, SESSION_KEYS, setKey } from '@/utils/storage/sessionStorage';
import { defineStore } from 'pinia'

export const useKeyStore = defineStore({
  id: 'keyStore',
  state: () => ({
    sessionToken: getData(LS_KEYS.SESSION) || "",
    masterEncryptionKey: getKey(SESSION_KEYS.MASTER_ENCRYPTION_KEY) || "",
    encryptedKeys: getData(LS_KEYS.KEYS) || {}
  }),

  getters: {
    getSessionToken: (state) => state.sessionToken,
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
    setSessionToken(token: string) {
        this.sessionToken = token;

        setData(LS_KEYS.SESSION, token);
    },

    setMasterEncryptionKey(key: string) {
        this.masterEncryptionKey = key;

        // Persist key in session storage
        setKey(SESSION_KEYS.MASTER_ENCRYPTION_KEY, key);
    },

    setEncryptedKeys(keys: Keys) {
        this.encryptedKeys = keys;

        setData(LS_KEYS.KEYS, keys);
    }
  },
})
