<template>
  <div class="flex flex-col h-full p-4" v-if="!isFirstLoad">
    <div class="flex justify-end" v-if="vaults.length !== 0 && !showCreateVault && !showEditVault">
      <b-button class="w-36" @click="router.push(`${PAGES.VAULT}/${activeVault && activeVault.id}/tokens/new`)">
        <div class="flex flex-row justify-center items-center space-x-1">
          <PlusCircleIcon class="w-4" />
          <span>Add</span>
        </div>
      </b-button>
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
    <div v-if="vaults.length !== 0 && !showCreateVault && !showEditVault"
      class="flex flex-col justify-center items-center h-full p-4 text-center space-y-2">
      <EmojiSadIcon class="w-12 text-mountain-meadow" />
      <p class="text-sm">You have no authentication tokens in your <span class="font-bold">{{ activeVault &&
          activeVault.name
      }}</span> vault.</p>
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

  <!-- Session expired modal -->
  <b-modal v-if="showExpiredSessionModal" @ok="handleLogout">
    <template v-slot:body>
      <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Session expired!</h3>
      <div class="mt-2">
        <p class="text-sm text-gray-500">All data on this device has been cleared, and you will be signed out.</p>
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon, MenuIcon, StatusOnlineIcon, StatusOfflineIcon } from "@heroicons/vue/outline"
import { useRouter } from "vue-router";

import { getAllVaults } from "@/utils/storage/indexedDB";
import { sleep } from '@/common/utils/sleep';
import { useKeyStore } from "@/stores/keyStore";
import { CryptoWorker } from "@/utils/comlink";
import { useVaultStore } from "@/stores/vaultStore";
import { useUserStore } from "@/stores/userStore";
import userService from "@/service/api/userService";
import { useAppStore } from "@/stores/appStore";
import { useLogout } from "@/composables/useLogout";

import { PAGES } from "@/router/pages";

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

    const appStore = useAppStore();
    const userStore = useUserStore();
    const keyStore = useKeyStore();
    const vaultStore = useVaultStore();

    // We don't want to allow any token related actions until the user
    // has vaults available. If they have just signed up, then this value
    // should be false.
    const isFirstLoad = ref(true);
    const vaults = computed(() => vaultStore.getAll);
    const activeVault = computed(() => vaultStore.getActive);
    const isOnline = computed(() => appStore.isOnline);

    // Sidebar refs
    const closeMenuMobile = ref(false);
    const showSidebarVaults = ref(false);
    const showSidebarUserOptions = ref(false);
    const showCreateVault = ref(false);
    const showEditVault = ref(false);
    const vaultToEdit = ref("");

    // Modal refs
    const showExpiredSessionModal = ref(false);

    onMounted(async () => {
      // First page load. What we should actually do here is fetch and set account data, decrypt the vaults and tokens
      // we already have got stored offline, then if the client is online, request for a sync.
      try {
        // Fetch account data
        const account = await userService.GetAccount();
        if (account.data) {
          userStore.setEmail(account.data.email)
        }
      } catch (error) {
        // Check for 401 unauthorised (invalid session)
        if (error.response && error.response.status === 401) {
          await useLogout();

          isFirstLoad.value = false;
          return showExpiredSessionModal.value = true;
        }
      }

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
        const decryptedVault = { ...encryptedVault };
        decryptedVault.key = vaultEncryptionKey;
        decryptedVault.name = decryptedName;
        decryptedVault.description = decryptedDescription;
        decryptedVault.icon = decryptedIcon;

        // Add the decrypted vault into the Vault Store
        vaultStore.add(decryptedVault);
      })

      // Now we can check for an active vault. If one isn't set,
      // then we want to get the first one available to us.
      const activeVaultID = vaultStore.getActiveID;
      if (!activeVaultID) {
        const decryptedVaults = vaultStore.getAll;
        if (decryptedVaults.length !== 0) {
          // Set the first vault as active vault
          vaultStore.setActive(decryptedVaults[0].id);
          router.push("/vaults/" + decryptedVaults[0].id)
        }
      }

      router.push("/vaults/" + activeVaultID)

      // Artificial sleep for a second...
      await sleep(1);

      isFirstLoad.value = false;
    })

    // handleLogout is called when we receive the "ok" event from the expired session modal.
    const handleLogout = () => {
      router.push({ path: PAGES.ROOT })
    }

    return {
      router,

      PAGES,

      isFirstLoad,
      vaults,
      activeVault,
      isOnline,

      closeMenuMobile,
      showSidebarVaults,
      showSidebarUserOptions,
      showCreateVault,
      showEditVault,
      vaultToEdit,

      showExpiredSessionModal,

      handleLogout
    };
  }
})
</script>