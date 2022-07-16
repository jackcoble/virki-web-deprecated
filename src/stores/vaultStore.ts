import type { EncryptedVault } from '@/models/vault';
import { defineStore } from 'pinia'

export const useVaultStore = defineStore({
    id: 'vaults',
    state: () => ({
        activeVaultId: localStorage.getItem("lastActiveVault") || "",
        vaults: [] as EncryptedVault[]
    }),
    getters: {
        getVaults: (state) => {
            // Return alphabetical list of vaults (by name)
            return state.vaults.sort((a, b) => a.name.localeCompare(b.name))
        },
        getActiveVaultId: (state) => state.activeVaultId,
        getActiveVault: (state) => {
            // If there's no active vault ID,
            // just fetch the first vault in state
            if (!state.activeVaultId) {
                return state.vaults[0];
            }

            // Otherwise find and return the vault active
            const activeVault = state.vaults.find(v => v.id === state.activeVaultId);
            return activeVault;
        }
    },
    actions: {
        add(vault: EncryptedVault) {
            // Check that the vault ID doesn't already exist. If it does, just update the vaults array
            // with the contents of the vault provided to us.
            const existingVaultIndex = this.vaults.findIndex(v => v.id === vault.id);
            if (existingVaultIndex !== -1) {
                this.vaults[existingVaultIndex] = vault;
            }
            else {
                this.vaults.push(vault);
            }
        },

        setActiveVault(id: string) {
            this.activeVaultId = id;
            localStorage.setItem("lastActiveVault", id)
        },

        clear() {
            this.vaults = [];
        }
    },
})
