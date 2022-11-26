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
    },

    getActiveID: () => {
      const userStore = useUserStore();
      return userStore.account.active_vault_id;
    },
    getActive: (state) => {
      const userStore = useUserStore();
      const activeVaultID = userStore.account.active_vault_id;

      if (activeVaultID) {
        const vault = state.vaults.get(activeVaultID);
        if (!vault) {
          return;
        }

        return vault;
      }
    }
  },

  actions: {
    add(vault: Vault) {
      this.vaults.set(vault.id, vault);
    },

    delete(vaultId: string) {
      this.vaults.delete(vaultId);
    },

    // Stores the ID of the active vault
    setActiveVault(id: string) {
      const userStore = useUserStore();
      userStore.setActiveVault(id);
    },

    clear() {
      this.vaults.clear();
    }
  },
})
