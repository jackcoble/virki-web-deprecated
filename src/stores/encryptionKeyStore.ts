import { defineStore } from 'pinia'

export const useEncryptionKeyStore = defineStore({
  id: 'encryptionKeys',
  state: () => ({
    masterPasswordStretched: localStorage.getItem("stretched_password") || "",
    masterKey: ""
  }),
  getters: {
    getMasterKey: (state) => state.masterKey,
    getStretchedPassword: (state) => state.masterPasswordStretched
  },
  actions: {
    setMasterKey (masterKey: string) {
      this.masterKey = masterKey;
    },

    // Use this for keeping stretched password just in memory for this session
    setStretchedPassword(password: string) {
      this.masterPasswordStretched = password;
    },

    // Use this for persisting stretched password
    memoriseStretchedPassword(password: string) {
      this.masterPasswordStretched = password;
      localStorage.setItem("stretched_password", password);
    },

    clear() {
      this.masterKey = "";
    }
  },
})
