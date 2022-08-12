import { defineStore } from 'pinia'

export const useEncryptionKeyStore = defineStore({
  id: 'encryptionKeys',
  state: () => ({
    stretched_master_password: localStorage.getItem("stretched_password") || "",
    encrypted_master_keypair: {
      private_key: "",
      public_key: ""
    },

    // This holds the decrypted master keypair, so this should never be persistent!
    master_keypair: {
      private_key: "",
      public_key: ""
    }
  }),
  getters: {
    getStretchedPassword: (state) => state.stretched_master_password,
    getMasterKeyPair: (state) => state.master_keypair,
    getEncryptedMasterKey: (state) => state.encrypted_master_keypair
  },
  actions: {
    // Populate all information from LocalStorage and into the store
    initialise() {
      // Encrypted master keypair
      const encryptedKeypairString = localStorage.getItem("encrypted_master_keypair");
      if (encryptedKeypairString) {
        const encryptedKeypair = JSON.parse(encryptedKeypairString);

        this.setEncryptedMasterKey(encryptedKeypair.private_key, encryptedKeypair.public_key);
      }
    },

    // Sets the decrypted master keypair
    setMasterKeyPair (private_key: string, public_key: string) {
      this.master_keypair.private_key = private_key;
      this.master_keypair.public_key = public_key;
    },

    // Use this for keeping stretched password just in memory or localStorage
    setStretchedPassword(password: string, persist?: boolean) {
      this.stretched_master_password = password;

      // Persist to LocalStorage if opted
      if (persist) {
        localStorage.setItem("stretched_password", password);
      }
    },

    // Store the encrypted master keypair for offline use
    setEncryptedMasterKey(private_key: string, public_key: string) {
      this.encrypted_master_keypair.private_key = private_key;
      this.encrypted_master_keypair.public_key = public_key;

      localStorage.setItem("encrypted_master_keypair", JSON.stringify(this.encrypted_master_keypair));
    },

    clear() {
      localStorage.removeItem("stretched_password");
      localStorage.removeItem("encrypted_master_key");
    }
  },
})
