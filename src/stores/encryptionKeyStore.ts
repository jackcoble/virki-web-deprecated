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

    // Use this for keeping stretched password just in memory or localStorage
    setStretchedPassword(password: string, persist: boolean = false) {
      this.masterPasswordStretched = password;

      // Persist to LocalStorage if opted
      if (persist) {
        localStorage.setItem("stretched_password", password);
      }
    },

    clear() {
      this.masterKey = "";
    }
  },
})
