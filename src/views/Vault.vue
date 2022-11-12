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

import { EmojiSadIcon, PlusCircleIcon, ClockIcon, XIcon } from "@heroicons/vue/outline"
import { useRouter } from "vue-router";

import { useKeyStore } from "@/stores/keyStore";
import { CryptoWorker } from "@/common/comlink";
import { useVaultStore } from "@/stores/vaultStore";
import { useAppStore } from "@/stores/appStore";
import { useLogout } from "@/composables/useLogout";

import { PAGES } from "@/router/pages";
import vaultService from "@/service/api/vaultService";
import type { Vault } from "@/common/interfaces/vault";

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
      // When the page first loads we should do a "sync" if the device is online. This is basically where we request for all the vaults, tokens and tags
      // and then we update our offline-cache from the results.
      if (appStore.isOnline) {
        try {
          /*
          const existingVaults = await indexedDBService.getAllVaults();
          await vaultService.sync(existingVaults).then(res => {
            const vaults: Vault[] = res.data.vaults;
            vaults.forEach(async v => {
              await indexedDBService.addVault(v);
            })
          })
          */
        } catch (e) {
          // Check for 401 unauthorised (invalid session)
          if (e.response && e.response.status === 401) {
            isFirstLoad.value = false;
            return showExpiredSessionModal.value = true;
          }

          // Otherwise something else has gone wrong...
          console.log(e);
        }
      }

      // Chances are that everything is up to date now,
      // so we can go ahead and decrypt all the vaults.
      const cryptoWorker = await new CryptoWorker();
      const existingVaults = [] as any[];

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

      isFirstLoad.value = false;
    })

    // handleLogout is called when we receive the "ok" event from the expired session modal.
    const handleLogout = () => {
      useLogout();
      router.push({ path: PAGES.ROOT });
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