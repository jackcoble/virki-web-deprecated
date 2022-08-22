<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="flex w-full justify-between items-center px-4 md:px-11 py-4 border-b-2 border-b-mountain-meadow bg-gray-100 space-x-3 shadow">
      <div>
        <!-- Logo -->
        <a href="/" class="hidden md:block">
          <img class="w-24" src="@/assets/images/virki_full_horizontal_transparent_dark.png" alt="Virki Logo" />
        </a>

        <!-- Menu icon (only visible on mobile) -->
        <button class="block md:hidden text-mountain-meadow w-9" @click="closeMenuMobile = !closeMenuMobile">
          <MenuIcon v-if="!closeMenuMobile" />
          <XIcon v-else />
        </button>
      </div>

      <!-- Search input -->
      <b-input class="w-full md:w-3/6" type="search" placeholder="Search for an entry or tag..."></b-input>

      <!-- New Entry or Vault button -->
      <div>
        <b-button v-if="vaults.length !== 0" type="submit" classType="primary">
          <div class="flex flex-row justify-center items-center space-x-1">
            <PlusCircleIcon class="w-5 md:-ml-1" />
            <span class="hidden md:block">New Entry</span>
          </div>
        </b-button>

        <b-button v-else type="submit" classType="primary">
          <div class="flex flex-row justify-center items-center space-x-1" @click="showCreateVault = !showCreateVault">
            <PlusCircleIcon class="w-5 md:-ml-1" />
            <span class="hidden md:block">Create Vault</span>
          </div>
        </b-button>
      </div>
    </div>

    <div class="flex flex-grow overflow-hidden">
      <!-- Sidebar -->
      <div class="flex-col flex-shrink-0 xl:w-1/6 md:w-1/4 sm:w-full" :class="closeMenuMobile ? 'block w-full' : 'hidden md:block'">
        <Sidebar />
      </div>

      <!-- Token entries -->
      <div class="flex-col flex-grow overflow-auto" v-if="!isFirstLoad" >
        <!-- Show message if no vaults are available -->
        <div v-if="vaults.length === 0 && !showCreateVault" class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
          <EmojiSadIcon class="w-24 text-mountain-meadow" />
          <p class="text-sm">To get started, you need to create a Vault.</p>
          <b-button class="w-36" @click="showCreateVault = !showCreateVault">
            <div class="flex flex-row justify-center items-center space-x-1">
              <PlusCircleIcon class="w-5 md:-ml-1" />
              <span>Create Vault</span>
            </div>
          </b-button>
        </div>

        <!-- Show frowny face if we've got no tokens, but have vaults available -->
        <div v-if="vaults.length !== 0" class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
          <EmojiSadIcon class="w-24 text-mountain-meadow" />
          <p class="text-sm">You have no authentication tokens in your vault.</p>
        </div>

        <CreateVault v-if="showCreateVault" />
      </div>

      <!-- Loading spinner -->
      <div v-else class="flex flex-col flex-grow justify-center items-center h-full p-4 text-center space-y-2">
         <svg
                class="animate-spin h-12 w-12 text-mountain-meadow"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                />
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon, MenuIcon } from "@heroicons/vue/outline"
import { useRouter } from "vue-router";

// Components
import Sidebar from "@/components/Sidebar.vue";
import CreateVault from "@/components/CreateVault.vue";
import { sleep } from "@/utils/common";
import { getAllVaults } from "@/utils/storage/indexedDB";
import { useKeyStore } from "@/stores/keyStore";
import { CryptoWorker } from "@/utils/comlink";
import { useVaultStore } from "@/stores/vaultStore";

export default defineComponent({
  name: "HomeView",
  components: {
    EmojiSadIcon,
    PlusCircleIcon,
    ClockIcon,
    XIcon,
    MenuIcon,

    Sidebar,
    CreateVault
  },
  setup() {
    const router = useRouter();
    const keyStore = useKeyStore();
    const vaultStore = useVaultStore();

    // We don't want to allow any token related actions until the user
    // has vaults available. If they have just signed up, then this value
    // should be false.
    const isFirstLoad = ref(true);
    const vaults = computed(() => vaultStore.getAll)

    // Sidebar refs
    const closeMenuMobile = ref(false);
    const showSidebarVaults = ref(false);
    const showSidebarUserOptions = ref(false);
    const showCreateVault = ref(false);

    onMounted(async () => {
      // Simulate first page load. What we should actually do here is decrypt the vaults and tokens
      // we already have got stored offline, then if the client is online, request for a sync.
      const cryptoWorker = await new CryptoWorker();
      const existingVaults = await getAllVaults();
      existingVaults.forEach(async encryptedVault => {
        // Decrypt the vault encryption key
        const masterEncryptionKey = keyStore.getMasterEncryptionKey;
        if (!masterEncryptionKey) {
          return;
        }

        // Base64 Encoded Vault Encryption Key
        const vaultEncryptionKey = await cryptoWorker.decrypt(masterEncryptionKey, encryptedVault.key);

        // We can proceed to decrypt the UTF8 text, description and icon properties
        let decryptedName, decryptedDescription, decryptedIcon;
        decryptedName = await cryptoWorker.decryptToUTF8(vaultEncryptionKey, encryptedVault.name);

        if (encryptedVault.description) {
          decryptedDescription = await cryptoWorker.decryptToUTF8(vaultEncryptionKey, encryptedVault.description);
        }
        if (encryptedVault.icon) {
          decryptedIcon = await cryptoWorker.decryptToUTF8(vaultEncryptionKey, encryptedVault.icon);
        }

        // Create a copy of the encrypted vault and replace the data...
        const decryptedVault = {...encryptedVault};
        decryptedVault.key = vaultEncryptionKey;
        decryptedVault.name = decryptedName;
        decryptedVault.description = decryptedDescription;
        decryptedVault.icon = decryptedIcon;

        // Add the decrypted vault into the Vault Store
        vaultStore.add(decryptedVault);
      })

      await sleep(2);

      isFirstLoad.value = false;
    })

    return {
      router,

      isFirstLoad,
      vaults,

      closeMenuMobile,
      showSidebarVaults,
      showSidebarUserOptions,
      showCreateVault,
    };
  }
})
</script>