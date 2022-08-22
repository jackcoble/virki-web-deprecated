import type { Vault } from '@/types/vault';
import { defineStore } from 'pinia'

/*
The vault store is dedicated to hold a decrypted copy of the vault data.
*/

export const useVaultStore = defineStore({
  id: 'vaultStore',
  state: () => ({
    vaults: new Map<string, Vault>
  }),

  getters: {
    getAll: (state) => {
        const vaults: Vault[] = [];
        state.vaults.forEach((v, k) => {
            vaults.push(v);
        })

        return vaults;
    }
  },

  actions: {
    add(vault: Vault) {
        this.vaults.set(vault.id, vault);
    },

    // Clear all decrypted data from the Hash Map
    clear() {
      this.vaults.clear();
    }
  },
})
