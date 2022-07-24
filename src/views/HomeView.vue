<template>
  <div class="h-screen bg-gray-50">

    <div class="container mx-auto p-4 space-y-3">
      <div class="flex justify-between items-center">
        <!-- Vault selection dropdown -->
        <VaultSelector />

        <div class="flex flex-col">
          <!-- Refresh vault button -->
          <button v-if="isOnline" class="rounded-full p-1 text-purple-800"
            :class="isRefreshingVault || isSyncing ? 'animate-reverse-spin' : ''" @click="refreshVault"
            :disabled="isRefreshingVault || isSyncing">
            <RefreshIcon class="w-6 h-6" />
          </button>

          <!-- Disconnected from cloud alert -->
          <OfflineAlertModal :show="showOfflineAlertModal" @close="showOfflineAlertModal = false"
            @done="showOfflineAlertModal = false" />
          <button v-if="!isOnline" class="rounded-full p-1 text-red-400"
            @click="showOfflineAlertModal = !showOfflineAlertModal">
            <StatusOfflineIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="flex-row">
        <label for="default-search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300">Search</label>
        <div class="relative">
          <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input type="search" id="default-search"
            class="pl-10 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2"
            placeholder="Search entries..." required>
        </div>
      </div>

      <div class="flex flex-col">
        <div v-if="entries && entries.length !== 0" v-for="entry in entries" :key="entry.t_id">
          <Entry :token="entry" />
          <div class="w-full border-t border-gray-300"></div>
        </div>

        <div v-else class="mt-48 items-center justify-items-center text-gray-400 mx-auto space-y-3">
          <EmojiSadIcon class="w-24 mx-auto" />
          <p class="text-sm text-center">
            You don't have any tokens in your <span class="font-semibold text-gray-800">{{
                vaultStore.getActiveVault?.name
            }}</span> vault.
          </p>
        </div>
      </div>
    </div>

    <p v-if="entries && entries.length !== 0" class="text-sm text-gray-400 text-center">{{ entries.length }} {{
        entries.length === 1 ? 'entry' : 'entries'
    }}</p>
  </div>
</template>

<script lang="ts">
import useEmitter from "@/composables/useEmitter";

import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import Entry from "../components/Entry.vue";
import VaultSelector from "@/components/VaultSelector.vue"

import { RefreshIcon, EmojiSadIcon, StatusOfflineIcon } from "@heroicons/vue/outline"
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";
import OfflineAlertModal from "../components/OfflineAlertModal.vue";
import useVault from "@/composables/useVault";
import useToaster from "@/composables/useToaster";
import vaultService from "@/service/api/vaultService";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { useTokenStore } from "@/stores/tokenStore";
import type { IVault } from "@/class/vault";
import { AuthoriserDB } from "@/class/db";
import useAuthoriserDB from "@/composables/useAuthoriserDB";

export default defineComponent({
  name: "HomeView",
  components: {
    Entry,
    VaultSelector,
    RefreshIcon,
    EmojiSadIcon,
    StatusOfflineIcon,
    OfflineAlertModal
  },
  setup() {
    const emitter = useEmitter();
    const vault = useVault();
    const toaster = useToaster();
    const authoriserDB = useAuthoriserDB();

    const applicationStore = useApplicationStore();
    const encryptionKeyStore = useEncryptionKeyStore();
    const vaultStore = useVaultStore();
    const tokenStore = useTokenStore();

    // Computed values from store
    const isOnline = computed(() => applicationStore.isOnline);
    const isSyncing = computed(() => applicationStore.isSyncing);

    const showOfflineAlertModal = ref(false);

    const isRefreshingVault = ref(false);
    const refreshVault = async () => {
      isRefreshingVault.value = true;

      await loadVaults()

      isRefreshingVault.value = false;
    }

    /*
      If we're online make a request to our API for a more up-to-date
      list of vaults, and handle any conflicts as necessary.
      
      Should the "offline" timestamp from the API be newer
      than the one on this device, we want to discard our local changes and replace with the more
      up to date one vault.

      In the other case, if our timestamp is newer than the one returned to us,
      update the API with our modified vault data.
    */
    const loadVaults = async () => {
      const db = new AuthoriserDB();
      const masterKeyPair = encryptionKeyStore.getMasterKeyPair;

      // Fetch a list of "online" vaults
      const res = await vaultService.GetVaults();
      const onlineVaults = res.data as IVault[] || [];

      // We can go through and compare the "online" vaults compared to the ones we have on this device.
      // We'll start off by iterating through the vaults on this device, and uploading any which contain an
      // offline timestamp, as these should be prioritised.
      const offlineVaults = await db.getVaults();
      offlineVaults.forEach(async offlineVault => {
        if (offlineVault.offline) {
          try {
            await vaultService.CreateVault(offlineVault);

            // If we've uploaded it, then we can remove the "offline" property and update the version on this device
            // and add it to the list of online vaults.
            delete offlineVault.offline;
            await db.insertVault(offlineVault);
            onlineVaults.push(offlineVault);
          } catch (e) {
            console.log("Error uploading vault created offline onto API server...");
            return;
          }
        }

        // Next, we should actually focus on syncing modifications or deletions to our vaults.
        // We'll start with deletions first as they are easiest. If we have a vault on our device which
        // isn't present in the response - it is safe to assume it's been deleted.
        const onlineVault = onlineVaults.find(o => o.v_id === offlineVault.v_id);
        if (!onlineVault) {
          await db.removeVault(offlineVault.v_id);
          vaultStore.remove(offlineVault.v_id);
        }
      });

      // We can then iterate through the vaults in the API response and determine if any changes need to be made/discarded locally
      onlineVaults.forEach(async onlineVault => {
        // We should have an equivalent offline vault now, so look it up for us to compare
        const offlineVault = offlineVaults.find(v => v.v_id === onlineVault.v_id);
        if (offlineVault) {
          // Now we can move onto sync modifications. If a modified timestamp on the offline vault is newer
          // than the one online, update the vault contents via the API.
          if (offlineVault.modified > onlineVault.modified) {
            await vaultService.UpdateVault(offlineVault);
          }

          // Otherwise if the online vault has changes newer than our offline vault,
          // discard any local modifications, and update IDB and the store.
          if (offlineVault.modified < onlineVault.modified) {
            const decryptedOnlineVault = await vault?.decryptFromVaultObject(onlineVault, masterKeyPair.privateKey, masterKeyPair.publicKey);
            if (decryptedOnlineVault) {
              await db.insertVault(onlineVault);
              vaultStore.add(decryptedOnlineVault);
            }
          }
        }

        else {
          // If we get tis far, we can just decrypt and add the vault to IDB + Store like normal
          await db.insertVault(onlineVault);
          const decryptedOnlineVault = await vault?.decryptFromVaultObject(onlineVault, masterKeyPair.privateKey, masterKeyPair.publicKey);
          if (decryptedOnlineVault) {
            vaultStore.add(decryptedOnlineVault);
          }
        }
      })
    }

    let interval: any;

    onMounted(async () => {
      if (!!applicationStore.isOnline) {
        await loadVaults();
      }

      // Fire off initial countdown event
      emitCountdownEvent();

      interval = setInterval(() => {
        // Emit the 'countdown' event every second
        emitCountdownEvent();
      }, 1000);
    })

    onBeforeUnmount(() => {
      clearInterval(interval);
    })

    // Function to handle firing off events to be consumed by 2FA entry
    const emitCountdownEvent = () => {
      const currentDate = new Date();
      const eventPayload = {
        milliseconds: Math.floor(currentDate.getTime()),
        seconds: Math.floor(currentDate.getTime() / 1000)
      }
      emitter.emit("countdown", eventPayload);
    }

    const entries = computed(() => tokenStore.getTokens);

    return {
      entries,
      isRefreshingVault,
      isOnline,
      isSyncing,

      showOfflineAlertModal,

      vaultStore,

      refreshVault
    };
  }
})
</script>