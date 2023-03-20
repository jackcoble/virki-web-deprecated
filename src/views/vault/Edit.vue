<template>
    <div class="p-9 lg:w-4/5 xl:w-2/5 mx-auto space-y-2">
        <div class="flex justify-between">
            <h1 class="text-2xl text-center text-mountain-meadow">{{ originalVault.name }}</h1>

            <b-button classType="danger" class="flex items-center justify-center w-14" @click="showDeleteVaultModal = !showDeleteVaultModal">
                <TrashIcon class="h-5 w-5 text-red-800" />
            </b-button>
        </div>

        <form @submit.prevent="updateVault" class="space-y-4 pt-4 pb-2 mx-auto">
            <b-icon-upload class="mx-auto" @imageData="vault.icon = $event" :image="vault.icon"></b-icon-upload>
            <b-input placeholder="Vault name" v-model="vault.name" required></b-input>
            
            <div class="flex space-x-2">
                <b-button classType="danger" @click="router.push(PAGES.LOGIN)">Cancel</b-button>
                <b-button type="submit" :loading="isUpdating">Update</b-button>
            </div>
        </form>
    </div>

    <!-- Delete vault confirmation modal -->
    <b-modal v-if="showDeleteVaultModal">
        <template v-slot:icon>
            <TrashIcon class="h-6 w-6 text-red-400" />
        </template>
        <template v-slot:body>
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Delete this vault?</h3>
            <div class="mt-2">
                <p class="text-sm text-gray-500">Deleting a vault is a permanent action. All tokens stored inside a vault will be deleted too.</p>
            </div>
        </template>
        <template v-slot:footer>
            <div class="flex justify-between space-x-2">
                <b-button classType="light" @click="showDeleteVaultModal = false">Cancel</b-button>
                <b-button classType="danger" @click="handleDelete">Delete</b-button>
            </div>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useVaultStore } from '@/stores/vaultStore';
import { EncryptionType } from "@/common/enums/encryptionType";
import type { Vault } from '@/common/interfaces/vault';
import { CryptoWorker } from '@/common/comlink';
import { sleep } from '@/common/utils/sleep';
import { serialiseCipherString } from '@/common/utils/cipher';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PAGES } from '@/router/pages';
import { TrashIcon } from "@heroicons/vue/outline"
import { VirkiStorageService } from '@/common/services/storage/storage.service.service';
import { useUserStore } from '@/stores/userStore';
import { computed } from '@vue/reactivity';

export default defineComponent({
    name: "EditVault",
    components: {
        TrashIcon
    },
    setup() {
        // Stores
        const vaultStore = useVaultStore();
        const userStore = useUserStore();

        const router = useRouter();
        const route = useRoute();

        const originalVault = ref({} as Vault);
        const vault = ref({} as Vault);
        const isUpdating = ref(false);

        // Refs for vault deletion
        const showDeleteVaultModal = ref(false);

        // Computed property for the vault ID parameter
        const vaultId = computed(() => route.params.id);
        watch(vaultId, (id: any) => {
            setDecryptedVault();
        })

        const setDecryptedVault = () => {
            // Lookup the decrypted vault object for the provided ID
            const decryptedVaults = vaultStore.getAll;
            const decryptedVault = decryptedVaults.find(v => v.id === vaultId.value);
            if (!decryptedVault) {
                console.log("No decrypted vault found for this ID...");
                return;
            }

            // We'll make a copy of the decrypted vault so we don't modify it everywhere...
            vault.value = {...decryptedVault};
            originalVault.value = {...decryptedVault}
        }

        onMounted(async () => {
            await sleep(0.1);
            setDecryptedVault();
        })

        // Handle when we want to update the vault. This involves re-encrypting the data
        const updateVault = async () => {
            isUpdating.value = true;

            // Fetch the encrypted copy of the vault so we don't have to re-encrypt certain data
            const encryptedVaults = [] as any[] // FIX
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

            // Update the vault in the encrypted and decrypted store
            const storageService = new VirkiStorageService();
            await storageService.addVault(encryptedVaultObject);
            vaultStore.add(vault.value);

            await sleep(1);
            isUpdating.value = false;
            router.push(PAGES.LOGIN);
        }

        // Handle when we want to delete a vault
        const handleDelete = async () => {
            // We can pull the vault ID from the route params
            const vaultId = route.params.id as string;
            
            // Delete from local DB
            const storageService = new VirkiStorageService();
            await storageService.deleteVault(vaultId);

            // Delete from decrypted Pinia store
            // and clear the active vault ID if the vault we're deleting is the active vault...
            vaultStore.delete(vaultId);
            if (vaultId === vaultStore.getActiveID) {
                userStore.clearActiveVault();
            }

            // TODO: Delete from online...

            // Close the modal and redirect to index
            showDeleteVaultModal.value = false;
            router.push(PAGES.LOGIN);
        }

        return {
            router,

            originalVault,
            vault,
            isUpdating,

            PAGES,

            updateVault,
            showDeleteVaultModal,
            handleDelete
        }
    } 
})
</script>