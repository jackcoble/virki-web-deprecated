import type { Token } from '@/models/token';
import type { Vault } from '@/models/vault';
import { defineStore } from 'pinia'

export const useVaultStore = defineStore({
    id: 'vaults',
    state: () => ({
        activeVaultId: localStorage.getItem("lastActiveVault") || "",
        vaults: [] as Vault[],
        tokens: [] as Token[]
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
            const activeVault = state.vaults.find(v => v._id === state.activeVaultId);
            return activeVault;
        },
        getTokens: (state) => state.tokens
    },
    actions: {
        add(vault: Vault) {
            // Check that the vault ID doesn't already exist. If it does, just update the vaults array
            // with the contents of the vault provided to us.
            const existingVaultIndex = this.vaults.findIndex(v => v._id === vault._id);
            if (existingVaultIndex !== -1) {
                this.vaults[existingVaultIndex] = vault;
            }
            else {
                this.vaults.push(vault);
            }
        },

        // Remove the vault from state
        remove(vaultId: string) {
            this.vaults = this.vaults.filter(v => v._id !== vaultId);
        },

        setActiveVault(id: string) {
            this.activeVaultId = id;
            localStorage.setItem("lastActiveVault", id)
        },

        // Add tokens to store
        addToken(token: Token) {
            // Check that the token ID doesn't already exist. If it does, just update the tokens array
            // with the contents of the token provided to us.
            const existingTokenIndex = this.tokens.findIndex(t => t._id === token._id);
            if (existingTokenIndex !== -1) {
                this.tokens[existingTokenIndex] = token;
            }
            else {
                this.tokens.push(token);
            }
        },

        clear() {
            this.vaults = [];
            this.activeVaultId = "";

            localStorage.removeItem("lastActiveVault");
        }
    },
})
