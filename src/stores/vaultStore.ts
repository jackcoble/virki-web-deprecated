import { defineStore } from 'pinia'
import type { GetVaultsResponseBody } from '@/service/api/types';

/*
The vault store is dedicated to hold a decrypted copy of the vault data.
*/

export const useVaultStore = defineStore({
  id: 'vaultStore',
  state: () => ({
    vaults: new Map<string, GetVaultsResponseBody>
  }),

  getters: {
    getAll: (state) => {
        const vaults: GetVaultsResponseBody[] = [];
        state.vaults.forEach((v, k) => {
            vaults.push(v);
        })

        return vaults;
    }
  },

  actions: {
    add(vault: GetVaultsResponseBody) {
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
