import { defineStore } from 'pinia'

export const useEncryptionKeyStore = defineStore({
  id: 'encryptionKeys',
  state: () => ({
    masterPasswordStretched: localStorage.getItem("stretched_password") || "",
    encryptedMasterKey: localStorage.getItem("encrypted_master_key") || "",
    masterKeyPair: {
      privateKey: "",
      publicKey: ""
    }
  }),
  getters: {
    getMasterKeyPair: (state) => state.masterKeyPair,
    getStretchedPassword: (state) => state.masterPasswordStretched,
    getEncryptedMasterKey: (state) => state.encryptedMasterKey
  },
  actions: {
    setMasterKeyPair (privateKey: string, publicKey: string) {
      this.masterKeyPair.privateKey = privateKey;
      this.masterKeyPair.publicKey = publicKey;
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
      localStorage.setItem("encrypted_master_key", encryptedMasterKey);
    },

    clear() {
      this.masterPasswordStretched = "";
      this.masterKeyPair.privateKey = "";
      this.masterKeyPair.publicKey = "";
      this.encryptedMasterKey = "";

      localStorage.removeItem("stretched_password");
      localStorage.removeItem("encrypted_master_key");
    }
  },
})
