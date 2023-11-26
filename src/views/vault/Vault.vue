<template>
  <div class="flex flex-col h-full" v-if="!isFirstLoad">
    <!-- Vault description and button to add new tokens -->
    <div class="flex items-center space-x-2 p-4 px-6 border-b-2 border-b-gray-300 bg-gray-200" v-if="vaults.length !== 0 && !showCreateVault && !showEditVault">
      <div v-if="vaultInUrl && vaultInUrl.description" class="flex flex-grow text-gray-700">
        <p>{{ vaultInUrl.description }}</p>
      </div>
      <div v-else class="flex w-full">
        <p class="hidden"></p>
      </div>

      <!-- Add tokens -->
      <div>
        <b-button class="w-36" @click="addTokensPage">
          <div class="flex flex-row justify-center items-center space-x-1">
            <PlusCircleIcon class="w-4" />
            <span>Add</span>
          </div>
        </b-button>
      </div>
    </div>

    <!-- Show message if no vaults are available -->
    <div v-if="vaults.length === 0 && !showCreateVault && !showEditVault"
      class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
      <img src="@/assets/images/eyes_emoji.gif" alt="Eyes emoji" class="w-16">
      <p class="text-sm">To get started, you need to create a Vault.</p>
    </div>

    <!-- Show frowny face if we've got no tokens, but have vaults available -->
    <div v-if="vaultIdPresent && vaults.length !== 0 && !showCreateVault && !showEditVault"
      class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
      <EmojiSadIcon class="w-12 text-mountain-meadow" />
      <p class="text-sm">You have no authentication tokens in this vault.</p>
    </div>
  </div>

  <!-- Loading spinner -->
  <div v-else class="flex flex-col flex-grow justify-center items-center h-full p-4 text-center space-y-2">
    <svg class="animate-spin h-10 w-10 text-mountain-meadow" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon } from "@heroicons/vue/outline"
import { useRoute, useRouter } from "vue-router";

import userService from "@/service/api/userService";
import storageService from "@/service/storage"
import { cryptoWorker } from "@/common/comlink";
import { useVaultStore } from "@/stores/vaultStore";
import { useAppStore } from "@/stores/appStore";

import { PAGES } from "@/router/pages";
import { useKeyStore } from "@/stores/keyStore";
import useToaster from "@/composables/useToaster";

export default defineComponent({
  name: "HomeView",
  components: {
    EmojiSadIcon,
    PlusCircleIcon,
    ClockIcon,
    XIcon
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toaster = useToaster();

    const appStore = useAppStore();
    const keyStore = useKeyStore();
    const vaultStore = useVaultStore();

    // We don't want to allow any token related actions until the user
    // has vaults available. If they have just signed up, then this value
    // should be false.
    const isFirstLoad = ref(true);
    const vaults = computed(() => vaultStore.getAll);
    const vaultIdPresent = computed(() => !!route.query.vault);
    const vaultInUrl = computed(() => vaultStore.getAll.find(v => v.id === route.params.id));
    const isOnline = computed(() => appStore.isOnline);

    onMounted(async () => {
      const masterEncryptionKey = keyStore.getMasterEncryptionKey;

      // Decrypt existing vaults on the device first. When we fetch
      // an up to date list of vaults after this, if there isn't a
      // vault in the response, but on the device, we can delete it
      // from the device as the server has no record of it existing.
      const existingVaults = await storageService.GetVaults();
      const existingVaultIDs: string[] = [];
      const latestVaultIDs: string[] = [];

      existingVaults.forEach(async v => {
        existingVaultIDs.push(v.id);

        // Decrypt the vault encryption key using the master key
        const vaultEncryptionKey = await cryptoWorker.decryptFromB64CipherString(v.encryptionKey, masterEncryptionKey);

        // We can proceed to decrypt the UTF8 name
        const decryptedName = await cryptoWorker.decryptFromB64CipherStringToUTF8(v.name, vaultEncryptionKey);

        // Create a copy of the encrypted vault (to retain all the metadata) and replace the encrypted data with decrypted...
        const decryptedVault = { ...v };
        decryptedVault.encryptionKey = vaultEncryptionKey;
        decryptedVault.name = decryptedName;

        // Try and decrypt the description if that is available
        if (v.description) {
          const decryptedDescription = await cryptoWorker.decryptFromB64CipherStringToUTF8(v.description, vaultEncryptionKey);
          decryptedVault.description = decryptedDescription
        }

        // Add the decrypted vault to the vault store
        vaultStore.add(decryptedVault);
      })

      // We can then fetch an up-to-date list of vaults
      // and decrypt those too.
      try {
        await userService.GetVaults().then(res => {
          const encryptedVaults = res.data;
          encryptedVaults.forEach(async v => {
            latestVaultIDs.push(v.id);

            // Decrypt the vault encryption key using the master key
            const vaultEncryptionKey = await cryptoWorker.decryptFromB64CipherString(v.encryptionKey, masterEncryptionKey);

            // We can proceed to decrypt the UTF8 name
            const decryptedName = await cryptoWorker.decryptFromB64CipherStringToUTF8(v.name, vaultEncryptionKey);

            // Create a copy of the encrypted vault (to retain all the metadata) and replace the encrypted data with decrypted...
            const decryptedVault = { ...v };
            decryptedVault.encryptionKey = vaultEncryptionKey;
            decryptedVault.name = decryptedName;

            // Try and decrypt the description if that is available
            if (v.description) {
              const decryptedDescription = await cryptoWorker.decryptFromB64CipherStringToUTF8(v.description, vaultEncryptionKey);
              decryptedVault.description = decryptedDescription
            }

            // Add the decrypted vault to the vault store and offline DB
            vaultStore.add(decryptedVault);
            await storageService.AddVault(v);
          })
        })
      } catch (e) {
        return toaster.error("An unknown error has occurred!");
      } finally {
        isFirstLoad.value = false;
      }

      // Compare the existing vault IDs against the latest vault IDs.
      // If there isn't an existing vault ID in the latest vault ID array,
      // delete the existing vault from the device, as the server
      // has no record of it. Creating vaults is an ONLINE action...
      const vaultIDsToDelete = existingVaultIDs.filter((id) => { return latestVaultIDs.indexOf(id) == -1; });
      vaultIDsToDelete.forEach(async id => {
        vaultStore.delete(id);
        await storageService.DeleteVault(id);
      })
    })

    // Sidebar refs
    const showCreateVault = ref(false);
    const showEditVault = ref(false);

    // Route user to add tokens page for this vault
    const addTokensPage = () => {
      // If we can find a vault ID in the params, add the token that vault.
      let vaultId = route.params.id;
      if (vaultId) {
        router.push(`${PAGES.VAULT}/${vaultId}/add-token`)
      } else {
        // If not, then check we've got vaults and use the first one which is returned.
        // If we have no vaults, just return.
        if (vaultStore.getAll.length > 0) {
          vaultId = vaultStore.getAll[0].id;
          router.push(`${PAGES.VAULT}/${vaultId}/add-token`)
        } else {
          return;
        }
      }
    }

    return {
      router,

      PAGES,

      isFirstLoad,
      vaults,
      isOnline,
      vaultIdPresent,
      vaultInUrl,

      showCreateVault,
      showEditVault,

      addTokensPage
    };
  }
})
</script>