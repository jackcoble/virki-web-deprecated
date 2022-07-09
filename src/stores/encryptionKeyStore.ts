import { defineStore } from 'pinia'

export const useEncryptionKeyStore = defineStore({
  id: 'encryptionKeys',
  state: () => ({
    masterKey: sessionStorage.getItem("masterKey") || null
  }),
  getters: {
    getMasterKey: (state) => state.masterKey
  },
  actions: {
    setMasterKey (masterKey: string) {
      this.masterKey = masterKey;

      // Store master key in sessionStorage
      sessionStorage.setItem("masterKey", masterKey);
    },

    clearEncryptionKeys() {
      this.masterKey = '';
    }
  },
})
