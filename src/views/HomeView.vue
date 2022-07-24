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
import useAccount from "@/composables/useAccount";
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
import useToken from "@/composables/useToken";
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
    const account = useAccount();
    const vault = useVault();
    const token = useToken();
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
      // Simulate loading be encrypting/decrypting items 50 times
      isRefreshingVault.value = true;

      for (let i = 0; i < 50; i++) {
        const encrypted = await account?.encryptData("Hello world!");
        const decrypted = await account?.decryptData(encrypted!);

        console.log("Decrypted data:", decrypted)
      }

      isRefreshingVault.value = false;
    }

    let interval: any;

    onMounted(async () => {
      if (!vault) {
        return;
      }

      // Just some preparation
      const db = new AuthoriserDB();
      const masterKeyPair = encryptionKeyStore.getMasterKeyPair;

      // Let's start with an initial load. If the vault store is empty,
      // we are going to assume that the page has just been loaded/refreshed, so populate that first!
      // As Authoriser is offline-first, we can attempt to populate with some entries from IndexedDB
      // before making a request to our API for updated entries.
      if (vaultStore.getVaults.length === 0) {
        // Fetch vaults from IndexedDB, decrypt them and set in store
        const vaults = await db.getVaults();
        vaults.forEach(async v => {
          const decryptedVault = await vault.decryptFromVaultObject(v, masterKeyPair.privateKey, masterKeyPair.publicKey);
          vaultStore.add(decryptedVault);
        });
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
      if (!!applicationStore.isOnline) {
        try {
          await vaultService.GetVaults().then(async res => {
            const vaults = res.data as IVault[];
            const offlineVaults = await db.getVaults();

            // Iterate through the offline vaults and check if we have any vaults that aren't on the server.
            offlineVaults.forEach(async ov => {
              if (!vaults.find(v => v.v_id === ov.v_id)) {
                console.log(`Cannot find ${ov.v_id} on server, so adding...`)
                await vaultService.CreateVault(ov);
              }
            })

            vaults.forEach(async v => {
              // Decrypt the vault
              const decryptedVault = await vault.decryptFromVaultObject(v, masterKeyPair.privateKey, masterKeyPair.publicKey);

              // Add to IDB and Pinia
              await authoriserDB.insertVault(v);
              vaultStore.add(decryptedVault)
            })
          })
        } catch (e) {
          if (e.response && e.response.data) {
            toaster.error(e.response.data.error);
          }

          // Something else has gone wrong
          toaster.error("Unknown error has occurred syncing vaults!");
        }
      }

      // Lets do the same as above, but for token entries instead!
      if (tokenStore.getTokens.length === 0) {
        const tokens = await token?.getTokensInDB();
        tokens?.forEach(async t => {
          const decryptedToken = await token?.decryptToken(t);
          tokenStore.add(decryptedToken!);
        });
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