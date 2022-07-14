import { Account } from "@/class/account";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default function useAccount () {
    // Fetch master key from the encryptionKeyStore
    // and initialise a new Account class
    const encryptionKeyStore = useEncryptionKeyStore();
    
    if (encryptionKeyStore.getMasterKey) {
        return new Account(encryptionKeyStore.getMasterKey);
    }
}