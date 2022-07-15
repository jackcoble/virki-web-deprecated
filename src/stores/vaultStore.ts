import type { EncryptedVault } from '@/models/vault';
import { defineStore } from 'pinia'

export const useVaultStore = defineStore({
  id: 'vaults',
  state: () => ({
    vaults: [] as EncryptedVault[] 
  }),
  getters: {
    getVaults: (state) => state.vaults
  },
  actions: {
    add(vault: EncryptedVault) {
        this.vaults.push(vault);
    }
  },
})
