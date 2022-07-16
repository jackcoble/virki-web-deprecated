import { Vault } from "@/class/vault";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default function useVault () {
    // Fetch master key from the encryptionKeyStore
    // and initialise a new Vault class
    const encryptionKeyStore = useEncryptionKeyStore();
    
    if (encryptionKeyStore.getMasterKey) {
        return new Vault(encryptionKeyStore.getMasterKey);
    }
}