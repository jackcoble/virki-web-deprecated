import { useKeyStore } from "@/stores/keyStore";
import { useUserStore } from "@/stores/userStore";
import { useVaultStore } from "@/stores/vaultStore";

// Use logout clears LocalStorage, SessionStorage, IndexedDB and the different Pinia stores.
export function useLogout() {
    // Stores
    const keyStore = useKeyStore();
    const userStore = useUserStore();
    const vaultStore = useVaultStore();

    // Clear all the data...
    keyStore.clearMasterEncryptionKey();
    userStore.clear();
    vaultStore.clear();
}