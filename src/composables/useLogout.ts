import { LocalStorageService } from "@/common/services/localStorage.service";
import { SessionStorageService } from "@/common/services/sessionStorage.service";
import { useKeyStore } from "@/stores/keyStore";
import { useUserStore } from "@/stores/userStore";
import { useVaultStore } from "@/stores/vaultStore";

import { deleteDBs } from "@/utils/storage/indexedDB";

// Use logout clears LocalStorage, SessionStorage, IndexedDB and the different Pinia stores.
export async function useLogout() {
    // Stores
    const keyStore = useKeyStore();
    const userStore = useUserStore();
    const vaultStore = useVaultStore();

    const localStorage = new LocalStorageService();
    const sessionStorage = new SessionStorageService();

    // Clear all the data...
    keyStore.clear();
    userStore.clear();
    vaultStore.clear();

    await deleteDBs();
    localStorage.clear();
    sessionStorage.clear();
}