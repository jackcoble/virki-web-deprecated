import { Token } from "@/class/token";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default function useToken () {
    // Fetch master key from the encryptionKeyStore
    // and initialise a new Vault class
    const encryptionKeyStore = useEncryptionKeyStore();
    
    if (encryptionKeyStore.getMasterKey) {
        return new Token(encryptionKeyStore.getMasterKey);
    }
}