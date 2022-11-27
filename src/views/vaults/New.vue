<template>
    <div class="flex justify-center items-center h-full">
        <div class="flex-col w-3/4 lg:w-4/5 xl:w-2/5 text-center">
            <LockClosedIcon class="text-mountain-meadow w-16 mx-auto" />
            <h1 class="text-2xl text-center font-bold">Create a new Vault</h1>
            <p class="font-medium">A vault allows you to securely store and organise your authentication tokens with
                End-to-End Encryption.</p>

            <form @submit.prevent="handleCreateVault" class="space-y-4 pt-4 pb-2 mx-auto">
                <b-icon-upload class="mx-auto" @imageData="vault.icon = $event"></b-icon-upload>
                <b-input placeholder="Vault name" v-model="vault.name" required></b-input>
                <b-text-area placeholder="Description of this Vault" v-model="vault.description"></b-text-area>

                <div class="flex space-x-2">
                    <b-button classType="danger" @click="router.push(PAGES.ROOT)">
                        <div class="flex flex-row justify-center items-center space-x-1">
                            <XIcon class="w-5 md:-ml-1" />
                            <span>Cancel</span>
                        </div>
                    </b-button>
                    <b-button type="submit" :loading="isCreatingVault">
                        <div class="flex flex-row justify-center items-center space-x-1">
                            <CheckIcon class="w-5 md:-ml-1" />
                            <span>Create</span>
                        </div>
                    </b-button>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import useToaster from '@/composables/useToaster';
import { PAGES } from '@/router/pages';
import { useKeyStore } from '@/stores/keyStore';
import { useVaultStore } from '@/stores/vaultStore';
import { EncryptionType } from "@/common/enums/encryptionType";
import type { Vault } from '@/common/interfaces/vault';
import { CryptoWorker } from '@/common/comlink';
import { sleep } from '@/common/utils/sleep';
import { serialiseCipherString } from '@/common/utils/cipher';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { LockClosedIcon } from "@heroicons/vue/solid"
import vaultService from "@/service/api/vaultService";
import { useAppStore } from '@/stores/appStore';
import { CheckIcon, XIcon } from "@heroicons/vue/outline"
import { VirkiStorageService } from '@/common/services/storage.service';

export default defineComponent({
    name: "CreateVault",
    components: {
        LockClosedIcon,
        CheckIcon,
        XIcon
    },
    setup() {
        const router = useRouter();

        const appStore = useAppStore();
        const keyStore = useKeyStore();
        const vaultStore = useVaultStore();
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

            // Store the encrypted vault in IndexedDB first
            const storageService = new VirkiStorageService();
            await storageService.addVault(encryptedVaultObject);

            // If online, send the encrypted vault to the API
            if (appStore.isOnline) {
                try {
                    await vaultService.addVault(encryptedVaultObject);
                } catch (e) {
                    return toaster.error("An unknown error occurred storing your vault on the Virki Sync server!");
                }
            }

            // Create a copy of the encrypted vault, but put in the decrypted data again before inserting into the "vaultStore"
            const decryptedVaultObject = { ...encryptedVaultObject };
            decryptedVaultObject.key = vaultEncryptionKey;
            decryptedVaultObject.name = vault.value.name;
            decryptedVaultObject.description = vault.value.description;
            decryptedVaultObject.icon = vault.value.icon;

            // Artificial sleep to keep the user waiting...
            await sleep(1.5);

            isCreatingVault.value = false;
            
            vaultStore.add(decryptedVaultObject);            
            router.push(`${PAGES.VAULT}/${encryptedVaultObject.id}`);
        }

        return {
            router,

            PAGES,

            vault,
            isCreatingVault,

            handleCreateVault,
        }
    }
})
</script>