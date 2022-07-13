import { defineStore } from 'pinia'

export const useEncryptionKeyStore = defineStore({
  id: 'encryptionKeys',
  state: () => ({
    masterPasswordStretched: localStorage.getItem("stretched_password") || "",
    encryptedMasterKey: sessionStorage.getItem("encrypted_master_key") || "",
    masterKey: ""
  }),
  getters: {
    getMasterKey: (state) => state.masterKey,
    getStretchedPassword: (state) => state.masterPasswordStretched,
    getEncryptedMasterKey: (state) => state.encryptedMasterKey
  },
  actions: {
    setMasterKey (masterKey: string) {
      this.masterKey = masterKey;
    },

    // Use this for keeping stretched password just in memory or localStorage
    setStretchedPassword(password: string, persist?: boolean) {
      this.masterPasswordStretched = password;

      // Persist to LocalStorage if opted
      if (persist) {
        localStorage.setItem("stretched_password", password);
      }
    },

    // Use this for settings the users encrypted master key in localStorage
    setEncryptedMasterKey(encryptedMasterKey: string) {
      this.encryptedMasterKey = encryptedMasterKey;
      sessionStorage.setItem("encrypted_master_key", encryptedMasterKey);
    },

    clear() {
      this.masterKey = "";
    }
  },
})
