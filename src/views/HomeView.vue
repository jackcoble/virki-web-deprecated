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

      // Iterate through and decrypt vaults local to this device first.
      // If we have a vault that hasn't been uploaded yet (contains the "offline" timestamp property),
      // then add its Vault ID to the vaultsToUpload array.
      const vaultsToUpload: string[] = [];
      const decryptedOfflineVaults: IVault[] = [];

      const offlineVaults = await db.getVaults();
      offlineVaults.forEach(async v => {
        // Check if the encrypted vault needs to be added to the vaultsToUpload array
        if (v.offline) {
          vaultsToUpload.push(v.v_id);
        }

        // We can then proceed to decrypt the vault and push to the decryptedOfflineVaults array.
        const decryptedVault = await vault?.decryptFromVaultObject(v, masterKeyPair.privateKey, masterKeyPair.publicKey);
        decryptedOfflineVaults.push(decryptedVault!);
      });

      // If we're online, fetch a list an update to date list of all vaults,
      // and compare them to the ones already on this device.
      if (applicationStore.isOnline === true) {
        const res = await vaultService.GetVaults();
        const onlineVaults = res.data as IVault[] || [];
    
        // When it comes to modifications, we will handle deletions first.
        // If a vault is not present in the API response, but is locally,
        // assume it has been deleted.
        // Filter out vaults which we have offline, but not online, and make sure they
        // aren't vaults which we have in the to be uploaded.
        const offlineVaultIDs = offlineVaults.map(x => x.v_id);
        const onlineVaultIDs = onlineVaults.map(x => x.v_id);

        // If we have a vault ID that is in offline array, but not online, remove it
        offlineVaultIDs.forEach(async offlineId => {
          if (vaultsToUpload.includes(offlineId)) {
            return;
          }

          if (!onlineVaultIDs.includes(offlineId)) {
            console.log("Deleting local vault as it doesn't exist server side:", offlineId);

            await db.removeVault(offlineId);
            vaultStore.remove(offlineId);
          }
        })

        // We have made it this far, so we can begin to handle modifications.
        // Go through the online vaults and compare them against our offline ones.
        onlineVaults.forEach(async onlineVault => {
          // Find the associated offline vault
          const offlineVault = offlineVaults.find(o => o.v_id === onlineVault.v_id);
          if (!offlineVault) {
            return;
          }

          // Make sure we aren't comparing against an offline vault
          if (offlineVault.offline) {
            return;
          }

          // If the modified timestamp on the online vault is newer than the offline,
          // discard our local changes
          if (onlineVault.modified > offlineVault.modified) {
            await db.insertVault(onlineVault);
          }

          // If the modified timestamp on the online timestamp is less than the offline,
          // assume local modifications have been made, so sync!
          if (onlineVault.modified < offlineVault.modified) {
            await vaultService.UpdateVault(offlineVault);
          }
        })

        // Lastly, we can upload any new vaults which were created offline
        vaultsToUpload.forEach(async vaultId => {
          const offlineVault = offlineVaults.find(v => v.v_id === vaultId);
          if (!offlineVault) {
            return;
          }

          // Create the vault server-side
          await vaultService.CreateVault(offlineVault);

          // Delete the offline property, save in IDB
          delete offlineVault.offline;
          await db.insertVault(offlineVault);

          // Decrypt and add to store
          const decrypted = await vault?.decryptFromVaultObject(offlineVault, masterKeyPair.privateKey, masterKeyPair.publicKey);
          if (decrypted) {
            vaultStore.add(decrypted);
          }
        })
      }
    }

    let interval: any;

    onMounted(async () => {
      await loadVaults();

      // Handle reconnections by syncing
      emitter.on("sync", async () => {
        applicationStore.setSyncing(true);
        await loadVaults();
        applicationStore.setSyncing(false);
      })

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