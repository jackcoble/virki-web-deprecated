import { Vault } from "@/class/vault";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default function useVault () {
    // Fetch master keypair from the encryptionKeyStore
    // and initialise a new Vault class
    const encryptionKeyStore = useEncryptionKeyStore();
    const masterKeyPair = encryptionKeyStore.getMasterKeyPair;
    
    if (masterKeyPair) {
        return new Vault(masterKeyPair.privateKey, masterKeyPair.publicKey);
    }
}