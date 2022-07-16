<template>
  <div class="h-screen bg-gray-50">

    <div class="container mx-auto p-4 space-y-3">
      <div class="flex justify-between">
        <!-- Vault selection dropdown -->
        <VaultSelector />

        <div class="flex-row">
          <!-- Refresh vault button -->
          <button v-if="isOnline" class="rounded-full p-1 text-purple-800" :class="isRefreshingVault ? 'animate-reverse-spin' : ''"
            @click="refreshVault">
            <RefreshIcon class="w-6 h-6" />
          </button>

          <!-- Disconnected from cloud alert -->
          <OfflineAlertModal :show="showOfflineAlertModal" @close="showOfflineAlertModal = false" @done="showOfflineAlertModal = false" />
          <button v-if="!isOnline" class="rounded-full p-1 text-red-400" @click="showOfflineAlertModal = !showOfflineAlertModal">
            <CloudIcon class="w-6 h-6" />
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
        <div v-if="entries && entries.length !== 0" v-for="entry in entries" :key="entry.issuer">
          <Entry :issuer="entry.issuer" :account="entry.account" :secret="entry.secret" :icon="entry.icon" />
          <div class="w-full border-t border-gray-300"></div>
        </div>

        <div v-else class="mt-48 items-center justify-items-center text-gray-400 mx-auto space-y-3">
          <EmojiSadIcon class="w-24 mx-auto" />
          <p class="text-sm text-center">
            You don't have any tokens in your <span class="font-semibold text-gray-800">{{ vaultStore.getActiveVault?.name }}</span> vault.
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

import { RefreshIcon, EmojiSadIcon, CloudIcon } from "@heroicons/vue/outline"
import vault from "@/service/api/vault";
import type { EncryptedVault } from "@/models/vault";
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";
import OfflineAlertModal from "../components/OfflineAlertModal.vue";

export default defineComponent({
  name: "HomeView",
  components: {
    Entry,
    VaultSelector,
    RefreshIcon,
    EmojiSadIcon,
    CloudIcon,
    OfflineAlertModal
},
  setup() {
    const emitter = useEmitter();
    const account = useAccount();

    const applicationStore = useApplicationStore();
    const vaultStore = useVaultStore();

    // Computed values from store
    const isOnline = computed(() => applicationStore.isOnline);

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
      // Fetch list of Vaults belonging to the user
      // and decrypt the data (if we don't already have a list of vaults already)
      if (vaultStore.getVaults.length === 0) {
        try {
          await vault.GetVaults().then(async res => {
            const vaults = res.data;
            if (vaults) {
              // Clear existing vaults
              vaultStore.clear()

              // Attempt to decrypt
              vaults.forEach(async (v: any) => {
                if (account) {
                  const decryptedVaultString = await account?.decryptData(v.data);
                  const decryptedVault = JSON.parse(decryptedVaultString!) as EncryptedVault;

                  // Add vault list of vaults in store
                  decryptedVault.id = v.id;
                  vaultStore.add(decryptedVault);
                }
              })

              // If we don't have an active vault already set,
              // set the first vault as the "default"
              if (!vaultStore.getActiveVaultId) {
                const firstVault = vaultStore.getVaults[0];
                vaultStore.setActiveVault(firstVault.id!);
              }
            }
          })
        } catch (e) {
          // TODO: Handle this better
          console.log("Error with vaults:", e)
        }
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

    const entries = [] as any[];

    return {
      entries,
      isRefreshingVault,
      isOnline,

      showOfflineAlertModal,

      vaultStore,

      refreshVault
    };
  }
})
</script>