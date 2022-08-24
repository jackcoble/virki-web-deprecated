import { useKeyStore } from "@/stores/keyStore";
import { useUserStore } from "@/stores/userStore";
import { useVaultStore } from "@/stores/vaultStore";

import { deleteDBs } from "@/utils/storage/indexedDB";
import { clearData } from "@/utils/storage/localStorage";
import { clearKeys } from "@/utils/storage/sessionStorage";

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

    await deleteDBs();
    clearKeys();
    clearData();
}