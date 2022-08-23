import type { Vault } from '@/types/vault';
import { getData, LS_KEYS, setData } from '@/utils/storage/localStorage';
import { defineStore } from 'pinia'

/*
The vault store is dedicated to hold a decrypted copy of the vault data.
*/

export const useVaultStore = defineStore({
  id: 'vaultStore',
  state: () => ({
    active: getData(LS_KEYS.ACTIVE_VAULT) || "",
    vaults: new Map<string, Vault>
  }),

  getters: {
    getAll: (state) => {
        const vaults: Vault[] = [];
        state.vaults.forEach((v, k) => {
            vaults.push(v);
        })

        return vaults;
    },

    getActiveID: (state) => state.active,
    getActive: (state) => {
      const vault = state.vaults.get(state.active);
      if (!vault) {
        return;
      }

      return vault;
    }
  },

  actions: {
    add(vault: Vault) {
        this.vaults.set(vault.id, vault);
    },

    // Stores the ID of the last active vault
    setActive(id: string) {
      this.active = id;

      setData(LS_KEYS.ACTIVE_VAULT, id);
    },

    // Clear all decrypted data from the Hash Map
    clear() {
      this.vaults.clear();
    }
  },
})
