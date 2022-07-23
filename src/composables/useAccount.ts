import { Account } from "@/class/account";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default function useAccount () {
    // Fetch master keypair from the encryptionKeyStore
    // and initialise a new Account class
    const encryptionKeyStore = useEncryptionKeyStore();
    const masterKeyPair = encryptionKeyStore.getMasterKeyPair;
    
    if (masterKeyPair) {
        return new Account(masterKeyPair.privateKey, masterKeyPair.publicKey);
    }
}