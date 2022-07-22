import type { IVault } from '@/class/vault';
import { defineStore } from 'pinia'

export const useVaultStore = defineStore({
    id: 'vaults',
    state: () => ({
        activeVaultId: localStorage.getItem("lastActiveVault") || "",
        vaults: [] as IVault[]
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
            const activeVault = state.vaults.find(v => v.v_id === state.activeVaultId);
            return activeVault;
        }
    },
    actions: {
        add(vault: IVault) {
            // Check that the vault ID doesn't already exist. If it does, just update the vaults array
            // with the contents of the vault provided to us.
            const existingVaultIndex = this.vaults.findIndex(v => v.v_id === vault.v_id);
            if (existingVaultIndex !== -1) {
                this.vaults[existingVaultIndex] = vault;
            }
            else {
                this.vaults.push(vault);
            }
        },

        // Remove the vault from state
        remove(vaultId: string) {
            this.vaults = this.vaults.filter(v => v.v_id !== vaultId);
        },

        setActiveVault(id: string) {
            this.activeVaultId = id;
            localStorage.setItem("lastActiveVault", id)
        },

        clear() {
            this.vaults = [];
            this.activeVaultId = "";

            localStorage.removeItem("lastActiveVault");
        }
    },
})
