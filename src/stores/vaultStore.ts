import type { Vault } from '@/types/vault';
import { defineStore } from 'pinia'

/*
The vault store is dedicated to hold a decrypted copy of the vault data.
*/

export const useVaultStore = defineStore({
  id: 'vaultStore',
  state: () => ({
    vaults: [] as Vault[]
  }),

  getters: {
    getAll: (state) => state.vaults
  },

  actions: {
    add(vault: Vault) {
        this.vaults.push(vault);
    }
  },
})
