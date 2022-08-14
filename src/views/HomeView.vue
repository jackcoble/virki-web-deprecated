<template>
  <div class="h-screen bg-gray-50">
    <div class="border-b-2 md:px-6 px-3 py-4">
      <div class="flex justify-between items-center">
        <!-- Vault selection dropdown -->
        <VaultSelector />

        <!-- Search input -->
        <b-input class="w-2/6" type="search" placeholder="Search for an entry or tag..."></b-input>

        <!-- Create button -->
        <div>
          <b-button type="submit" classType="primary" @click="showCreateActionModal = !showCreateActionModal">
            <div class="flex flex-row justify-center space-x-1">
              <PlusCircleIcon class="w-4 -ml-1" />
              <span>Create</span>
            </div>
          </b-button>
        </div>
      </div>
    </div>

    <div class="container mx-auto p-4 space-y-3">
      <div class="flex flex-col space-y-3 pt-4">
        <div v-if="entries && entries.length !== 0" v-for="entry in entries" :key="entry._id">
          <Entry :token="entry" />
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

  <!-- Create action modal -->
  <BaseModal v-if="showCreateActionModal" @close="showCreateActionModal = !showCreateActionModal" noFooter>
      <template v-slot:body>
          <div class="flex flex-col space-y-2 text-center pb-4">
              <h1 class="text-xl">Create</h1>
          </div>

          <fieldset class="space-y-2">
              <!-- Create token entry-->
              <div class="flex flex-row items-center px-4 py-10 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
                  <div class="flex-col flex-shrink-0 object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
                      <ClockIcon class="text-gray-500 rounded-full" />
                  </div>

                  <div class="flex-col">
                    <p class="text-lg font-medium text-gray-700 select-none">Entry</p>
                    <p class="text-xs">Create a new authentication token entry by scanning a QR code or inputting the details manually.</p>
                  </div>
              </div>

              <!-- Create a tag -->
              <div class="flex flex-row items-center px-4 py-10 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
                  <div class="flex-col flex-shrink-0 object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
                      <TagIcon class="text-gray-500 rounded-full" />
                  </div>

                  <div class="flex-col">
                    <p class="text-lg font-medium text-gray-700 select-none">Tag</p>
                    <p class="text-xs">Tags are a quick and easy way to organise different categories within a vault.</p>
                  </div>
              </div>

              <!-- Create a vault -->
              <div class="flex flex-row items-center px-4 py-10 w-100 text-sm h-14 space-x-3 cursor-pointer border-2 rounded-md">
                  <div class="flex-col flex-shrink-0 object-contain rounded-full w-9 h-9 p-1.5 bg-gray-200 border-2 border-gray-300">
                      <LockClosedIcon class="text-gray-500 rounded-full" />
                  </div>

                  <div class="flex-col">
                    <p class="text-lg font-medium text-gray-700 select-none">Vault</p>
                    <p class="text-xs">Create separate vaults for Personal, Work, etc.</p>
                  </div>
              </div>
          </fieldset>
      </template>
  </BaseModal>
</template>

<script lang="ts">
import useEmitter from "@/composables/useEmitter";

import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import VaultSelector from "@/components/VaultSelector.vue"

import { RefreshIcon, EmojiSadIcon, StatusOfflineIcon, PlusCircleIcon, ClockIcon, TagIcon, LockClosedIcon } from "@heroicons/vue/outline"
import { useVaultStore } from "@/stores/vaultStore";
import { useApplicationStore } from "@/stores/appStore";
import OfflineAlertModal from "../components/OfflineAlertModal.vue";
import useToaster from "@/composables/useToaster";
import usePouchDB from "@/composables/usePouchDB";
import useVault from "@/composables/useVault";
import { useEncryptionKeyStore } from "@/stores/encryptionKeyStore";
import { useRouter } from "vue-router";
import Entry from "@/components/Entry.vue"
import BaseModal from "@/components/Modal/BaseModal.vue"

export default defineComponent({
  name: "HomeView",
  components: {
    VaultSelector,
    RefreshIcon,
    EmojiSadIcon,
    StatusOfflineIcon,
    OfflineAlertModal,
    PlusCircleIcon,
    ClockIcon,
    TagIcon,
    LockClosedIcon,
    Entry,
    BaseModal
  },
  setup() {
    const router = useRouter();

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

    const showCreateActionModal = ref(false);

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
        const decrypted = await vault.decryptFromVaultObject(v, encryptionKeyStore.getMasterKeyPair.private_key, encryptionKeyStore.getMasterKeyPair.public_key);
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
        const decrypted = await vault.decryptFromVaultObject(v, encryptionKeyStore.getMasterKeyPair.private_key, encryptionKeyStore.getMasterKeyPair.public_key);
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

    const entries = computed(() => vaultStore.getTokens);

    return {
      router,

      entries,
      isRefreshingVault,
      isOnline,
      isSyncing,
      showCreateActionModal,

      vaultStore,

      refreshVault
    };
  }
})
</script>