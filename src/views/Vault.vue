<template>
  <div class="flex flex-col h-full p-4" v-if="!isFirstLoad">
    <!-- Button to add entry to vault -->
    <div class="flex justify-end p-2 pb-4" v-if="vaults.length !== 0 && !showCreateVault && !showEditVault">
      <div class="flex">
        <b-button class="w-36">
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
      <b-button class="w-36" @click="router.push(PAGES.NEW_VAULT)">
        <div class="flex flex-row justify-center items-center space-x-1">
          <PlusCircleIcon class="w-5 md:-ml-1" />
          <span>Create Vault</span>
        </div>
      </b-button>
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
    <svg class="animate-spin h-10 w-10 text-mountain-meadow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon } from "@heroicons/vue/outline"
import { useRoute, useRouter } from "vue-router";

import { useVaultStore } from "@/stores/vaultStore";
import { useAppStore } from "@/stores/appStore";

import { PAGES } from "@/router/pages";
import vaultService from "@/service/api/vaultService";
import type { Vault } from "@/common/interfaces/vault";
import { CryptoWorker } from "@/common/comlink";
import { useKeyStore } from "@/stores/keyStore";

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

    const appStore = useAppStore();
    const vaultStore = useVaultStore();
    const keyStore = useKeyStore();

    // We don't want to allow any token related actions until the user
    // has vaults available. If they have just signed up, then this value
    // should be false.
    const isFirstLoad = ref(true);
    const vaults = computed(() => vaultStore.getAll);
    const presentVaultId = computed(() => route.query.vault);
    const vaultIdPresent = computed(() => !!route.query.vault);
    const isOnline = computed(() => appStore.isOnline);

    // Sidebar refs
    const showSidebarVaults = ref(false);
    const showCreateVault = ref(false);
    const showEditVault = ref(false);

    onMounted(async () => {
      // If there is no vault ID in the query params, default to showing all
      if (!route.query.vault) {
        router.replace({
          path: PAGES.VAULT,
          query: {
            vault: 'all'
          }
        })
      }

      // Fetch all the vaults if we're online and decrypt them.
      if (appStore.isOnline) {
        try {
          const res = await vaultService.getVaults();
          const vaults: Vault[] = res.data;

          // Prepare a CryptoWorker for us to use, along with our master encryption key
          const cryptoWorker = await new CryptoWorker();
          const masterEncryptionKey = keyStore.getMasterEncryptionKey;

          // Decrypt and add to the Pinia vault store
          if (vaults) {
            vaults.forEach(async vault => {
              // Decrypt the vault encryption key using the master key
              const vaultEncryptionKey = await cryptoWorker.decryptFromB64CipherString(vault.encryption_key, masterEncryptionKey);

              // We can proceed to decrypt the UTF8 name
              const decryptedName = await cryptoWorker.decryptFromB64CipherStringToUTF8(vault.name, vaultEncryptionKey);

              // Create a copy of the encrypted vault (to retain all the metadata) and replace the encrypted data with decrypted...
              const decryptedVault = { ...vault };
              decryptedVault.encryption_key = vaultEncryptionKey;
              decryptedVault.name = decryptedName;

              // Add the decrypted vault into the Vault Store
              vaultStore.add(decryptedVault);
            }) 
          }
        } catch (e) {
          // TODO: Handle this...
          console.log(e);
        }
      }

      isFirstLoad.value = false;
    })

    return {
      router,

      PAGES,

      isFirstLoad,
      vaults,
      isOnline,
      presentVaultId,
      vaultIdPresent,

      showSidebarVaults,
      showCreateVault,
      showEditVault
    };
  }
})
</script>