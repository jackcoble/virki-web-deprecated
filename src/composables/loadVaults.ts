import type { EncryptedVault } from "@/models/vault";
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";

import useAccount from "./useAccount";
import type { IVaultDB } from "@/class/db";
import vault from "@/service/api/vault";
import { computed } from "vue";

// Handles the loading, decryption and setting of the active vault
export async function loadVaults() {
    // Need to use stores in the function scope
    const applicationStore = useApplicationStore();
    const vaultStore = useVaultStore();
    const account = useAccount();

    // Prepare computed properties
    const isOnline = computed(() => applicationStore.isOnline);

    /* 
        If we have no vaults in the Vault store, check IndexedDB for some that we might have locally.
        We can use these initially, and make a request to the API to check for any changes later.
      */
    if (vaultStore.getVaults.length === 0 && account) {
        const localVaults = await account?.getVaultsFromDB();
        localVaults.forEach(async vault => {
            // Decrypt the vault and add to store
            const decryptedVaultString = await account.decryptData(vault.data);
            const decryptedVault = JSON.parse(decryptedVaultString) as EncryptedVault;

            decryptedVault.id = vault.id;
            vaultStore.add(decryptedVault);
        })
    }

    // If we're online, fetch a list of vaults from the API, decrypt them,
    // and set/update in the Vault store.
    if (!!isOnline.value && account) {
        try {
            // Fetch vaults
            const res = await vault.GetVaults();
            if (res && res.data) {
                const vaults = res.data as IVaultDB[]; // Already formatted as to how we want them stored in IndexedDB.

                vaults.forEach(async v => {
                    const decryptedVaultString = await account.decryptData(v.data);
                    const decryptedVault = JSON.parse(decryptedVaultString) as EncryptedVault;
                    decryptedVault.id = v.id;

                    // For good measure we should put this in IndexedDB too (just in case data has updated at all!)
                    await account.addVaultToDB(v);

                    // Then we can add/update the store
                    vaultStore.add(decryptedVault);
                })
            }
        } catch (e) {
            // If we hit this, something has gone wrong with either the API requestor Decryption.
            console.log(e);
        }
    }

    // At this point we should have a vault, so set a default "active vault"
    if (!vaultStore.getActiveVaultId) {
        const firstVault = vaultStore.getVaults[0];
        vaultStore.setActiveVault(firstVault.id!);
    }
}