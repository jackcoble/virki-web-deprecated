<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <Navigation />

        <div class="flex flex-grow overflow-hidden">
            <!-- Sidebar (controllable with a meta property) -->
            <div v-if="route.meta.sidebar" class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 sm:w-full" :class="openMobileMenu ? 'block w-full' : 'hidden md:block'">
                <Sidebar />
            </div>

            <!-- Main content -->
            <div class="flex-col flex-grow overflow-auto">
                <slot />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Components
import Navigation from '../components/Navigation.vue';
import Sidebar from '@/components/Sidebar.vue';
import { useAppStore } from '@/stores/appStore';
import { useVaultStore } from '@/stores/vaultStore';
import { CryptoWorker } from '@/common/comlink';
import { VirkiStorageService } from '@/common/services/storage.service';
import { useKeyStore } from '@/stores/keyStore';

export default defineComponent({
    name: "LayoutVault",
    components: {
        Sidebar,
        Navigation
    },
    setup() {
        const appStore = useAppStore();
        const vaultStore = useVaultStore();
        const keyStore = useKeyStore();
        const route = useRoute();

        const openMobileMenu = computed(() => appStore.shouldOpenMobileMenu);

        onMounted(async () => {
            // Since this is the main "vault" layout, we should do all fetching of encrypted vaults,
            // and decryption in here...
            const cryptoWorker = await new CryptoWorker();
            const storageService = new VirkiStorageService();
            const existingVaults = await storageService.getVaults();

            // Decrypt the vaults
            existingVaults.forEach(async encryptedVault => {
                // Decrypt the vault encryption key
                const masterEncryptionKey = keyStore.getMasterEncryptionKey;
                if (!masterEncryptionKey) {
                    return;
                }

                // Base64 Encoded Vault Encryption Key
                const vaultEncryptionKey = await cryptoWorker.decryptFromB64CipherString(encryptedVault.key, masterEncryptionKey)

                // We can proceed to decrypt the UTF8 text, description and icon properties
                let decryptedName, decryptedDescription, decryptedIcon;
                decryptedName = await cryptoWorker.decryptFromB64CipherStringToUTF8(encryptedVault.name, vaultEncryptionKey);

                if (encryptedVault.description) {
                decryptedDescription = await cryptoWorker.decryptFromB64CipherStringToUTF8(encryptedVault.description, vaultEncryptionKey);
                }
                if (encryptedVault.icon) {
                decryptedIcon = await cryptoWorker.decryptFromB64CipherStringToUTF8(encryptedVault.icon, vaultEncryptionKey);
                }

                // Create a copy of the encrypted vault (to retain all the metadata) and replace the encrypted data with decrypted...
                const decryptedVault = { ...encryptedVault };
                decryptedVault.key = vaultEncryptionKey;
                decryptedVault.name = decryptedName;
                decryptedVault.description = decryptedDescription;
                decryptedVault.icon = decryptedIcon;

                // Add the decrypted vault into the Vault Store
                vaultStore.add(decryptedVault);
            })
        })

        return {
            openMobileMenu,
            route
        }
    }
})
</script>