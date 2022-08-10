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

      <div class="flex flex-col">
        <div v-if="entries && entries.length !== 0" v-for="entry in entries" :key="entry">
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
import VaultSelector from "@/components/VaultSelector.vue"

import { RefreshIcon, EmojiSadIcon, StatusOfflineIcon } from "@heroicons/vue/outline"
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";
import OfflineAlertModal from "../components/OfflineAlertModal.vue";
import useToaster from "@/composables/useToaster";
import usePouchDB from "@/composables/usePouchDB";
import useVault from "@/composables/useVault";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";

export default defineComponent({
  name: "HomeView",
  components: {
    VaultSelector,
    RefreshIcon,
    EmojiSadIcon,
    StatusOfflineIcon,
    OfflineAlertModal
  },
  setup() {
    const emitter = useEmitter();
    const toaster = useToaster();
    const vault = useVault();
    const pouchdb = usePouchDB();

    const applicationStore = useApplicationStore();
    const encryptionKeyStore = useEncryptionKeyStore();
    const vaultStore = useVaultStore();

    // Computed values from store
    const isOnline = computed(() => applicationStore.isOnline);
    const isSyncing = computed(() => applicationStore.isSyncing);

    const showOfflineAlertModal = ref(false);

    const isRefreshingVault = ref(false);
    const refreshVault = async () => {
      if (!vault) {
        return;
      }

      isRefreshingVault.value = true;

      // Synchronise, fetch and decrypt vaults
      await pouchdb.synchronise();

      const encryptedVaults = await pouchdb.getVaults();
      encryptedVaults.forEach(async v => {
        const decrypted = await vault.decryptFromVaultObject(v, encryptionKeyStore.getMasterKeyPair.privateKey, encryptionKeyStore.getMasterKeyPair.publicKey);
        vaultStore.add(decrypted)
      })

      isRefreshingVault.value = false;
    }

    let interval: any;

    onMounted(async () => {
      // Don't continue if no vault is set
      if (!vault) {
        return;
      }

      // Synchronise and create/update existing indexes if needed.
      await pouchdb.synchronise();
      await pouchdb.createIndexes();

      // We can loop through the encrypted vaults, decrypt them and then set them in the store
      const encryptedVaults = await pouchdb.getVaults();
      encryptedVaults.forEach(async v => {
        const decrypted = await vault.decryptFromVaultObject(v, encryptionKeyStore.getMasterKeyPair.privateKey, encryptionKeyStore.getMasterKeyPair.publicKey);
        vaultStore.add(decrypted)
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

    const entries = ref([]);

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