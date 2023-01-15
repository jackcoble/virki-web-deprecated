import type { Vault } from '@/common/interfaces/vault';
import { defineStore } from 'pinia'
import { useUserStore } from './userStore';

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

    delete(vaultId: string) {
      this.vaults.delete(vaultId);
    },

    clear() {
      this.vaults.clear();
    }
  },
})
