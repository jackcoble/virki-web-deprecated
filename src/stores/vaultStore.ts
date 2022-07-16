import type { EncryptedVault } from '@/models/vault';
import { defineStore } from 'pinia'

export const useVaultStore = defineStore({
    id: 'vaults',
    state: () => ({
        activeVaultId: localStorage.getItem("lastActiveVault") || "",
        vaults: [] as EncryptedVault[]
    }),
    getters: {
        getVaults: (state) => state.vaults,
        getActiveVaultId: (state) => state.activeVaultId,
        getActiveVault: (state) => {
            const activeVaultId = state.activeVaultId;
            const activeVault = state.vaults.find(v => v.id === activeVaultId);

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
