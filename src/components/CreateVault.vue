<template>
    <div class="p-9 lg:w-4/5 xl:w-2/5 mx-auto space-y-2">
        <h1 class="text-2xl text-center">Create a new Vault</h1>
        <p>In order to store authentication tokens, you need a Vault. This allows you to organise your tokens and keep them in one place!</p>

        <form @submit.prevent="handleCreateVault" class="space-y-4 pt-4 pb-2 mx-auto">
            <b-icon-upload class="mx-auto"></b-icon-upload>
            <b-input placeholder="Vault name" v-model="vault.name"></b-input>
            <b-text-area placeholder="Description of this Vault" v-model="vault.description"></b-text-area>
            <b-button type="submit" :loading="isCreatingVault">Create</b-button>
        </form>
    </div>
</template>

<script lang="ts">
import useToaster from '@/composables/useToaster';
import { useKeyStore } from '@/stores/keyStore';
import { EncryptionType } from '@/types/crypto';
import type { Vault } from '@/types/vault';
import { CryptoWorker } from '@/utils/comlink';
import { sleep } from '@/utils/common';
import { serialiseCipherString } from '@/utils/crypto/cipher';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: "CreateVault",
    setup() {
        const keyStore = useKeyStore();
        const toaster = useToaster();

        const vault = ref({} as Vault);
        const isCreatingVault = ref(false);

        // Handle creating an encrypted vault using the data from the "vault" ref.
        const handleCreateVault = async () => {
            isCreatingVault.value = true;

            // Derive an encryption key for the vault. This is what all entries under this vault will use to encrypt data.
            const cryptoWorker = await new CryptoWorker();
            const vaultEncryptionKey = await cryptoWorker.generateEncryptionKey();

            // We want to encrypt the vault encryption key with our master encryption key.
            const masterEncryptionKey = keyStore.getMasterEncryptionKey;
            if (!masterEncryptionKey) {
                return toaster.error("Master encryption key not present on device!");
            }

            // Serialise this into a cipher string
            const encryptedVaultKeyObject = await cryptoWorker.encryptToB64(vaultEncryptionKey, masterEncryptionKey);
            const encryptedVaultKey = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedVaultKeyObject.ciphertext, encryptedVaultKeyObject.nonce, encryptedVaultKeyObject.mac);

            // We need to then encrypt the name, description and icon with the vault encryption key.
            let encryptedName, encryptedDescription, encryptedIcon;
            const encryptedNameObject = await cryptoWorker.encryptUTF8(vault.value.name, vaultEncryptionKey);
            encryptedName = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedNameObject.ciphertext, encryptedNameObject.nonce, encryptedNameObject.mac);
            
            if (vault.value.description) {
                const encryptedDescriptionObject = await cryptoWorker.encryptUTF8(vault.value.description, vaultEncryptionKey);
                encryptedDescription = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedDescriptionObject.ciphertext, encryptedDescriptionObject.nonce, encryptedDescriptionObject.mac);
            }
            if (vault.value.icon) {
                const encryptedIconObject = await cryptoWorker.encryptUTF8(vault.value.icon, vaultEncryptionKey);
                encryptedIcon = await serialiseCipherString(EncryptionType.XCHACHA20_POLY1305, encryptedIconObject.ciphertext, encryptedIconObject.nonce, encryptedIconObject.mac);
            }

            // Construct a vault object with the encrypted data
            const vaultId = window.crypto.randomUUID();
            const createdDate = Math.floor(new Date().getTime() * 1000); // Unix microseconds

            const encryptedVaultObject: Vault = {
                id: vaultId,
                key: encryptedVaultKey,
                name: encryptedName,
                description: encryptedDescription,
                icon: encryptedIcon,
                created: createdDate,
                modified: createdDate
            }

            // Artificial sleep to keep the user waiting...
            await sleep(1.5);

            isCreatingVault.value = false;
        }

        return {
            vault,
            isCreatingVault,

            handleCreateVault
        }
    }
})
</script>