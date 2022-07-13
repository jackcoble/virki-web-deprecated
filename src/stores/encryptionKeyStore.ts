import { defineStore } from 'pinia'

export const useEncryptionKeyStore = defineStore({
  id: 'encryptionKeys',
  state: () => ({
    masterKey: ""
  }),
  getters: {
    getMasterKey: (state) => state.masterKey
  },
  actions: {
    setMasterKey (masterKey: string) {
      this.masterKey = masterKey;
    },

    clear() {
      this.masterKey = "";
    }
  },
})
