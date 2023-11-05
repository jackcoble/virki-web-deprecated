import { useKeyStore } from "@/stores/keyStore";
import { useUserStore } from "@/stores/userStore";
import { useVaultStore } from "@/stores/vaultStore";

// Use logout clears LocalStorage, SessionStorage, IndexedDB and the different Pinia stores.
export async function useLogout() {
    // Stores
    const keyStore = useKeyStore();
    const userStore = useUserStore();
    const vaultStore = useVaultStore();

    // Clear all the data...
    keyStore.clear();
    userStore.clear();
    vaultStore.clear();

    // TODO: Revoke the user session
}