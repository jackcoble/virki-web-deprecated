import { Account } from "@/class/account";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default function useAccount () {
    // Fetch master key from the encryptionKeyStore
    // and initialise a new Account class
    const encryptionKeyStore = useEncryptionKeyStore();
    
    if (encryptionKeyStore.getMasterKey) {
        const masterKeyBuffer = new TextEncoder().encode(encryptionKeyStore.getMasterKey);
        return new Account(masterKeyBuffer);
    }
}