<template>
    <div class="p-9 lg:w-4/5 xl:w-2/5 mx-auto space-y-2">
        <h1 class="text-2xl text-center">Editing <span class="text-mountain-meadow">{{ originalVault.name }}</span></h1>

        <form @submit.prevent="updateVault" class="space-y-4 pt-4 pb-2 mx-auto">
            <b-icon-upload class="mx-auto" @imageData="vault.icon = $event" :image="vault.icon"></b-icon-upload>
            <b-input placeholder="Vault name" v-model="vault.name" required></b-input>
            <b-text-area placeholder="Description of this Vault" v-model="vault.description"></b-text-area>
            
            <div class="flex space-x-2">
                <b-button type="submit" :loading="isUpdating">Update</b-button>
                <b-button classType="danger" @click="router.push(PAGES.ROOT)">Cancel</b-button>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { useVaultStore } from '@/stores/vaultStore';
import { EncryptionType } from '@/types/crypto';
import type { Vault } from '@/types/vault';
import { CryptoWorker } from '@/utils/comlink';
import { sleep } from '@/common/utils/sleep';
import { serialiseCipherString } from '@/common/utils/cipher';
import { getAllVaults, insertVault } from '@/utils/storage/indexedDB';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PAGES } from '@/router/pages';

export default defineComponent({
    name: "EditVault",
    setup() {
        // Stores
        const vaultStore = useVaultStore();

        const router = useRouter();
        const route = useRoute();

        const originalVault = ref({} as Vault);
        const vault = ref({} as Vault);
        const isUpdating = ref(false);

        onMounted(() => {
            const vaultId = route.params.id;

            // Lookup the decrypted vault object for the provided ID
            const decryptedVaults = vaultStore.getAll;
            const decryptedVault = decryptedVaults.find(v => v.id === vaultId);
            if (!decryptedVault) {
                console.log("Error");
                return;
            }

            // We'll make a copy of the decrypted vault so we don't modify it everywhere...
            vault.value = {...decryptedVault};
            originalVault.value = {...decryptedVault}
        })

        // Handle when we want to update the vault. This involves re-encrypting the data
        const updateVault = async () => {
            isUpdating.value = true;

            // Fetch the encrypted copy of the vault so we don't have to re-encrypt certain data
            const encryptedVaults = await getAllVaults();
            const originalEncryptedVault = encryptedVaults.find(v => v.id === vault.value.id);
            if (!originalEncryptedVault) {
                return;
            }

            // Spin up a CryptoWorker and get the vault encryption key
            const cryptoWorker = await new CryptoWorker();
            const vaultEncryptionKey = vault.value.key;

            // We need to then re-encrypt the name, description and icon with the vault encryption key.
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

            // Need to set the modification date of the vault
            const modifiedDate = Math.floor(new Date().getTime() * 1000); // Unix microseconds

            // Pack all the data into a new vault object and insert pack into IndexedDB.
            const encryptedVaultObject: Vault = {
                id: originalEncryptedVault.id,
                key: originalEncryptedVault.key,
                name: encryptedName,
                description: encryptedDescription,
                icon: encryptedIcon,
                created: originalEncryptedVault.created,
                modified: modifiedDate
            }

            await insertVault(encryptedVaultObject);
            await sleep(1);

            // Update the decrypted vault in the vault store
            vaultStore.add(vault.value);

            isUpdating.value = false;

            router.push(PAGES.ROOT);
        }

        return {
            router,

            originalVault,
            vault,
            isUpdating,

            PAGES,

            updateVault
        }
    } 
})
</script>